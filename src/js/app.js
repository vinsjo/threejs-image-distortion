import { createAnimation } from './animation.js';
import {smileyFill, smileyNoFill} from "../assets";


const animation = createAnimation(
	'.animation-container',
	[smileyFill, smileyNoFill],
	// getComputedStyle(document.body).getPropertyValue('accent-color') || null
);

animation.start();

$('.burger.icon').on('click', function () {
	$(this).toggleClass('open');
	$(this).is('.burger.icon.open')
		? $('.burger-nav').addClass('show')
		: $('.burger-nav').removeClass('show');
});

$('.icon.pause').on('click', function () {
	$(this).toggleClass('paused');
	$(this).is('.paused') ? animation.stop() : animation.start();
});

$(window).on('keydown', event => {
	switch (event.key) {
		case ' ':
			$('.icon.pause').trigger('click');
			break;
	}
});
