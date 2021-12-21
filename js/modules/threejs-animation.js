/**
 * @module smiley-animation
 * @requires jQuery
 * @requires jCanvas
 * @requires THREE
 * @requires shaders
 * @requires helpers
 */
import * as THREE from 'https://threejs.org/build/three.module.js';
import { createShaderMaterial } from './shaders.js';

function createAnimation(container, images, dpr = 1) {
	const scene = new THREE.Scene();
	const clock = new THREE.Clock();
	const renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: false,
	});

	const camera = new THREE.PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		1,
		500
	);
	camera.position.z = 1;

	renderer.setPixelRatio(dpr);
	renderer.setSize(window.innerWidth, window.innerHeight);
	$(container).append(renderer.domElement);

	const rows = 5;
	const cols = Math.floor(camera.aspect * rows);

	const imageTexture = createImageGrid(
		images,
		rows,
		cols,
		window.innerWidth * dpr,
		window.innerHeight * dpr,
		0.2
	);

	const mesh = new THREE.Mesh(
		new THREE.PlaneGeometry(camera.aspect * 2, 2, 1, 1),
		createShaderMaterial(imageTexture, 0.3, 5, 0.2)
	);

	scene.add(mesh);

	let animating = true;

	function animate() {
		if (!animating) return;
		try {
			mesh.material.uniforms.uTime.value = clock.getElapsedTime();
			renderer.render(scene, camera);
		} catch (e) {
			console.error(e);
			return;
		}
		requestAnimationFrame(animate);
	}

	$(window).on('resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	return {
		start() {
			animating = true;
			animate();
		},
		stop() {
			animating = false;
		},
		toggle() {
			animating = !animating;
			animating && animate();
		},
	};
}

function createImageGrid(
	images,
	rows,
	cols,
	width = 1024,
	height = 1024,
	paddingFraction = 0.25
) {
	const imgSize = {
		width: Math.max(...images.map(img => img.naturalWidth)),
		height: Math.max(...images.map(img => img.naturalHeight)),
	};
	const cell = {
		width: Math.floor(width / cols),
		height: Math.floor(height / rows),
	};
	const padding = Math.min(cell.width, cell.height) * paddingFraction;

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

export { createAnimation, createImageGrid };