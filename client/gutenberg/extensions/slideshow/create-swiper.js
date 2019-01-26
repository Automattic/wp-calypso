/**
 * External dependencies
 */
import { merge } from 'lodash';

export default async function createSwiper( container = '.swiper-container', params = {} ) {
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

	const [ { default: Swiper } ] = await Promise.all( [
		import( /* webpackChunkName: "swiper" */ 'swiper' ),
		import( /* webpackChunkName: "swiper" */ 'swiper/dist/css/swiper.css' ),
	] );
	return new Swiper( container, merge( {}, defaultParams, params ) );
}
