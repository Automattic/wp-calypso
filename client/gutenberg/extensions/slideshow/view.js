/** @format */

/**
 * External dependencies
 */
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import createSwiper from './create-swiper';
import './style.scss';

typeof window !== 'undefined' &&
	window.addEventListener( 'load', function() {
		const slideshowBlocks = document.getElementsByClassName( 'wp-block-jetpack-slideshow' );
		forEach( slideshowBlocks, slideshowBlock => {
			const { effect } = slideshowBlock.dataset;
			const slideshowContainer = slideshowBlock.getElementsByClassName( 'swiper-container' )[ 0 ];

			createSwiper( slideshowContainer, { effect, init: true, initialSlide: 0 } );
		} );
	} );
