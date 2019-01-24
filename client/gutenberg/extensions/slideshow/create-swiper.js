/**
 * External dependencies
 */
import Swiper from 'swiper';
import 'swiper/dist/css/swiper.min.css';
import { merge } from 'lodash';

export default function createSwiper( container = '.swiper-container', params = {} ) {
	const defaultParams = {
		effect: 'slide',
		grabCursor: true,
		init: true,
		initialSlide: 0,
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
	};
	return new Swiper( container, merge( {}, defaultParams, params ) );
}
