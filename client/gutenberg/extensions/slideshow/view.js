/** @format */

/**
 * External dependencies
 */
import Swiper from 'swiper';
import 'swiper/dist/css/swiper.min.css';

// TODO: Use actual attributes
const initialSlide = 0;
const effect = 'fade';

typeof window !== 'undefined' &&
	window.addEventListener( 'load', function() {
		console.log( 'init swiper' ); // TODO: Remove

		const swiperInstance = new Swiper( '.swiper-container', {
			effect: effect,
			grabCursor: true,
			init: false,
			initialSlide: initialSlide,
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			},
			pagination: {
				clickable: true,
				el: '.swiper-pagination',
				type: 'bullets',
			},
			preventClicksPropagation: false /* Necessary for normal block interactions */,
			releaseFormElements: false,
			setWrapperSize: true,
			touchStartPreventDefault: false,
		} );
	} );
