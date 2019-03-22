/**
 * External dependencies
 */
import { mapValues, merge } from 'lodash';

/**
 * Internal dependencies
 */
import './style.scss';

export default async function createSwiper(
	container = '.swiper-container',
	params = {},
	callbacks = {}
) {
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
			bulletElement: 'button',
			clickable: true,
			el: '.swiper-pagination',
			type: 'bullets',
		},
		preventClicksPropagation: false /* Necessary for normal block interactions */,
		releaseFormElements: false,
		setWrapperSize: true,
		touchStartPreventDefault: false,
		on: mapValues(
			callbacks,
			callback =>
				function() {
					callback( this );
				}
		),
	};
	const [ { default: Swiper } ] = await Promise.all( [
		import( /* webpackChunkName: "swiper" */ 'swiper/dist/js/swiper.js' ),
		import( /* webpackChunkName: "swiper" */ 'swiper/dist/css/swiper.css' ),
	] );
	return new Swiper( container, merge( {}, defaultParams, params ) );
}
