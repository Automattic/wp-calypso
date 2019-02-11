/**
 * External dependencies
 */
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import createSwiper from './create-swiper';

typeof window !== 'undefined' &&
	window.addEventListener( 'load', function() {
		const slideshowBlocks = document.getElementsByClassName( 'wp-block-jetpack-slideshow' );
		forEach( slideshowBlocks, slideshowBlock => {
			const { autoplay, delay, effect } = slideshowBlock.dataset;
			const slideshowContainer = slideshowBlock.getElementsByClassName( 'swiper-container' )[ 0 ];
			createSwiper( slideshowContainer, {
				autoplay: autoplay ? { delay: delay * 1000 } : false,
				effect,
				init: true,
				initialSlide: 0,
			} );
		} );
	} );
