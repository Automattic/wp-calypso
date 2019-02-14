/**
 * External dependencies
 */
import '@babel/polyfill';

/**
 * Internal dependencies
 */
import './style.scss';

export default async function createSwiper(
	container = '.swiper-container',
	params = {},
	callbacks = {}
) {
	const on = Object.entries( callbacks ).reduce( ( total, [ key, callback ] ) => {
		total[ key ] = function() {
			callback( this );
		};
		return total;
	}, {} );
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
		on,
	};
	const [ { default: Swiper } ] = await Promise.all( [
		import( /* webpackChunkName: "swiper" */ 'swiper' ),
		import( /* webpackChunkName: "swiper" */ 'swiper/dist/css/swiper.css' ),
	] );
	return new Swiper( container, Object.assign( {}, defaultParams, params ) );
}
