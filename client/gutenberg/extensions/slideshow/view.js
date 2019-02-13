/**
 * External dependencies
 */
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import createSwiper from './create-swiper';
import swiperResize from './swiper-resize';

typeof window !== 'undefined' &&
	window.addEventListener( 'load', function() {
		const slideshowBlocks = document.getElementsByClassName( 'wp-block-jetpack-slideshow' );
		forEach( slideshowBlocks, slideshowBlock => {
			const { autoplay, delay, effect } = slideshowBlock.dataset;
			const slideshowContainer = slideshowBlock.getElementsByClassName( 'swiper-container' )[ 0 ];
			createSwiper(
				slideshowContainer,
				{
					autoplay: autoplay ? { delay: delay * 1000 } : false,
					effect,
					init: true,
					initialSlide: 0,
					loop: true,
					keyboard: {
						enabled: true,
						onlyInViewport: true,
					},
				},
				{
					init: swiperResize,
					imagesReady: swiperResize,
					resize: swiperResize,
				}
			);
		} );
	} );
