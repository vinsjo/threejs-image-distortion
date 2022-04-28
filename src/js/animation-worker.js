import * as THREE from 'three';

const state = {
	width: 1,
	height: 1,
	frameCount: 0,
	isAnimating: false,
};

const animationSpeed = 0.5;

function main(data) {
	const { canvas } = data;
	const renderer = new THREE.WebGLRenderer({
		canvas,
		alpha: true,
		antialias: false,
	});

	const camera = new THREE.PerspectiveCamera(
		25,
		state.width / state.height,
		0.1,
		1000
	);

	let mesh = null;

	camera.position.z = 2;
}

function render(renderer, camera) {
	time *= 0.001;
	if (resizeRenderer(renderer)) {
		camera.aspect = state.width / state.height;
		camera.updateProjectionMatrix();
	}
}

function size({ width, height }) {
	state.width = width;
	state.height = height;
}
/**
 * @param {THREE.WebGLRenderer} renderer
 */
function resizeRenderer(renderer) {
	const cnv = renderer.domElement;
	const { width, height } = state;
	if (width === cnv.width && height === cnv.height) return false;
	renderer.setSize(width, height, false);
	return true;
}

const handlers = {
	main,
	size,
};

self.onmessage = function ({ data }) {
	const fn = handlers[data.type];
	if (typeof fn !== 'function') {
		throw new Error('no handler for type: ' + data.type);
	}
	fn(data);
};
