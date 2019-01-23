/** @format */

/**
 * Internal dependencies
 */
import createSwiper from './create-swiper';
import './style.scss';

// TODO: Use actual attributes

typeof window !== 'undefined' &&
	window.addEventListener( 'load', function() {
		createSwiper( { effect: 'slide', init: true, initialSlide: 0 } );
	} );
