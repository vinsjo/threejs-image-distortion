import {
	createAnimation,
	createImageGrid,
} from './modules/threejs-animation.js';

const bgColor = '{ r: 35, g: 39, b: 169 }';

function start() {
	const animation = createAnimation(
		'.animation-container',
		[...$('.smiley.template')],
		1
	);
	animation.start();
}

start();
