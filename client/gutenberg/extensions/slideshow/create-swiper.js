/**
 * External dependencies
 */
import Swiper from 'swiper';
import 'swiper/dist/css/swiper.min.css';

export default function createSwiper( { effect = 'slide', init = true, initialSlide = 0 } ) {
	return new Swiper( '.swiper-container', {
		effect,
		grabCursor: true,
		init,
		initialSlide,
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
}
