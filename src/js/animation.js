import * as THREE from 'three';
import { vertShader, fragShader } from './shaders';
import { preloadImages } from './utils';
import smileyNoFill from '../assets/smiley-nofill.svg';
import smileyFill from '../assets/smiley.svg';
import workerSrc from './animation-worker.js?url';

function initAnimation() {
	const cnv = $('#cnv')[0];
	if (!cnv.transferControlToOffscreen) {
		$(cnv).hide();
		$('#noOffscreenCnv').show();
		$('.animation-container').addClass('show');
		return;
	}

	const dpr = window.devicePixelRatio || 1;
	const scene = new THREE.Scene();

	const offscreen = cnv.transferControlToOffscreen();

	const worker = new Worker(workerSrc, { type: 'module' });
	worker.postMessage({ type: 'main', canvas: offscreen }, [offscreen]);

	function sendSize() {
		worker.postMessage({
			type: 'size',
			width: cnv.clientWidth,
			height: cnv.clientHeight,
		});
	}
	$(window).on('resize', sendSize);
	sendSize();
	// renderer.setPixelRatio(dpr);
	// renderer.setSize(canvasRect.width, canvasRect.height, false);

	camera.position.z = 2;

	const animationSpeed = 0.5;

	let frameCount = 0;
	let isAnimating = false;
	let mesh = null;

	function updateFrameCount() {
		if (!mesh) return;
		frameCount++;
		mesh.material.uniforms.uTime.value = frameCount * animationSpeed;
	}

	function renderScene() {
		updateFrameCount();
		renderer.render(scene, camera);
	}

	const animation = {
		start() {
			isAnimating = true;
			animate();
		},
		stop() {
			isAnimating = false;
		},
		toggle() {
			isAnimating ? this.stop() : this.start();
		},
		get isAnimating() {
			return frameCount < 3 || isAnimating;
		},
	};

	function animate() {
		if (!animation.isAnimating) return;
		renderScene();
		requestAnimationFrame(animate);
	}

	function onTextureLoad(texture) {
		if (!texture) throw 'Failed Loading Texture :(';
		mesh = new THREE.Mesh(
			new THREE.PlaneGeometry(cnvRect.width / cnvRect.height, 1),
			new THREE.ShaderMaterial({
				vertexShader: vertShader,
				fragmentShader: fragShader,
				transparent: true,
				side: THREE.DoubleSide,
				uniforms: {
					uTime: { value: 0.0 },
					uTexture: {
						value: new THREE.TextureLoader().load(texture),
					},
					uNoiseFreq: {
						value: 5,
					},
					uNoiseAmp: {
						value: 0.2,
					},
					uNoiseLimit: {
						value: 0.2,
					},
					uNoiseSpeed: {
						value: 0.01,
					},
				},
			})
		);
		scene.add(mesh);
		animation.start();
		$('.animation-container').addClass('show');
		setTimeout(() => {
			$('.animation-caption').addClass('show');
		}, 500);
	}

	const rows = Math.floor(Math.random() * 4) + 1;
	const cols = Math.ceil(cnvRect.width / (cnvRect.height / rows));

	createImageGrid(
		[smileyFill, smileyNoFill],
		rows,
		cols,
		cnvRect.width * dpr,
		cnvRect.height * dpr,
		0.25,
		0.25
	)
		.then(onTextureLoad)
		.catch((e) => console.error(e));

	return animation;
}

async function createImageGrid(
	imageURLs,
	rows,
	cols,
	width = 1024,
	height = 1024,
	cellPaddingRatio = 0.2,
	outerPaddingRatio = 0.1
) {
	const images = await preloadImages(imageURLs);
	if (!images.length) return false;

	const imgSize = {
		width: Math.max(...images.map((img) => img.naturalWidth)),
		height: Math.max(...images.map((img) => img.naturalHeight)),
	};

	const outerPadding = Math.min(width, height) * outerPaddingRatio;

	const cell = {
		width: Math.floor((width - outerPadding * 2) / cols),
		height: Math.floor((height - outerPadding * 2) / rows),
	};

	const padding = Math.min(cell.width, cell.height) * cellPaddingRatio;

	const scale =
		(Math.min(cell.width, cell.height) - padding) /
		Math.max(imgSize.width, imgSize.height);

	const offset = new THREE.Vector2(
		(cell.width - imgSize.width * scale) * 0.5,
		(cell.height - imgSize.height * scale) * 0.5
	);

	const cnv = $(`<canvas width="${width}" height="${height}"></canvas>`);

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const img = images[Math.floor(Math.random() * images.length)];
			cnv.drawImage({
				source: img,
				x: outerPadding + col * cell.width + offset.x,
				y: outerPadding + row * cell.height + offset.y,
				width: imgSize.width * scale,
				height: imgSize.height * scale,
				fromCenter: false,
			});
		}
	}
	return cnv.getCanvasImage('png');
}

export { initAnimation };
