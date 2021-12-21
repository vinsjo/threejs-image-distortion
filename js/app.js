import * as THREE from 'https://threejs.org/build/three.module.js';
import { fragShader, vertShader, createShaderMaterial } from './shaders.js';

(async function () {
	const dpr = 1;
	// const dpr = window.devicePixelRatio;

	const scene = new THREE.Scene();
	const clock = new THREE.Clock();
	const renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: false,
	});

	const camera = new THREE.OrthographicCamera();

	renderer.setPixelRatio(dpr);
	renderer.setSize(window.innerWidth, window.innerHeight);

	$('.threejs-container').append(renderer.domElement);

	const rows = 5;
	const cols = Math.floor((window.innerWidth / window.innerHeight) * rows);

	const textureImage = await createImageGrid(
		['../assets/smiley.svg', '../assets/smiley-nofill.svg'],
		rows,
		cols,
		new THREE.Vector2(window.innerWidth * dpr, window.innerHeight * dpr),
		0.3
	);

	const mesh = new THREE.Mesh(
		new THREE.PlaneGeometry(
			(window.innerWidth / window.innerHeight) * 2,
			2,
			1,
			1
		),
		createShaderMaterial(textureImage, 0.3, 5, 0.2)
	);

	scene.add(mesh);

	function animate() {
		try {
			mesh.material.uniforms.uTime.value = clock.getElapsedTime();
			renderer.render(scene, camera);
		} catch (e) {
			console.error(e);
			return;
		}
		requestAnimationFrame(animate);
	}

	animate();

	$(window).on('resize', () => {
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});
})();

async function createImageGrid(
	urls,
	rows,
	cols,
	resolution = { x: 1024, y: 1024 },
	paddingFraction = 0.25
) {
	const images = await preloadImages(urls);

	const imgSize = {
		width: Math.max(...images.map(img => img.naturalWidth)),
		height: Math.max(...images.map(img => img.naturalHeight)),
	};
	const cell = {
		width: Math.floor(resolution.x / cols),
		height: Math.floor(resolution.y / rows),
	};
	const padding = Math.min(cell.width, cell.height) * paddingFraction;

	const scale =
		(Math.min(cell.width, cell.height) - padding) /
		Math.max(imgSize.width, imgSize.height);

	const offset = new THREE.Vector2(
		(cell.width - imgSize.width * scale) * 0.5,
		(cell.height - imgSize.height * scale) * 0.5
	);

	const cnv = $(`<canvas></canvas>`);
	cnv.attr('width', resolution.x);
	cnv.attr('height', resolution.y);

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const img = images[Math.floor(Math.random() * images.length)];
			cnv.drawImage({
				source: $(img).attr('src'),
				x: col * cell.width + offset.x,
				y: row * cell.height + offset.y,
				width: imgSize.width * scale,
				height: imgSize.height * scale,
				fromCenter: false,
			});
		}
	}
	return cnv.getCanvasImage('png');
}

async function preloadImages(urls) {
	const loaded = [];
	for await (const img of urls.map(
		url =>
			new Promise((resolve, reject) => {
				const img = $(`<img src=${url}>`);
				img.on('load', function () {
					resolve(this);
				});
				img.on('error', function () {
					reject('failed loading ' + url);
				});
			})
	)) {
		loaded.push(img);
	}
	return loaded;
}
