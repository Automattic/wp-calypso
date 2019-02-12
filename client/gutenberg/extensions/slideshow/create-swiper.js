/**
 * External dependencies
 */
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import './style.scss';

export default async function createSwiper(
	container = '.swiper-container',
	params = {},
	callbacks = {}
) {
	const on = {};
	for ( const id in callbacks ) {
		const callback = callbacks[ id ];
		on[ id ] = function() {
			callback( this );
		};
	}
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
		/* We probably won't end up needing both init and imagesReady. Just casting a wide net for now. */
		on,
	};
	const [ { default: Swiper } ] = await Promise.all( [
		import( /* webpackChunkName: "swiper" */ 'swiper' ),
		import( /* webpackChunkName: "swiper" */ 'swiper/dist/css/swiper.css' ),
	] );
	return new Swiper( container, merge( {}, defaultParams, params ) );
}
