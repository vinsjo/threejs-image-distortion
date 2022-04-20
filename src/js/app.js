import { initAnimation } from './animation';

const animation = initAnimation();

$(window).on('keydown', (event) => {
	switch (event.key) {
		case ' ':
			animation.toggle();
			break;
	}
});

$('.icon.pause').on('click', function () {
	$(this).toggleClass('paused');
	$(this).is('.paused') ? animation.stop() : animation.start();
});

$(window).on('orientationchange', () => {
	$(window).trigger('resize');
});
