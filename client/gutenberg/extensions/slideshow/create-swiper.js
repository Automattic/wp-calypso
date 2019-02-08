/**
 * External dependencies
 */
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import './style.scss';

const SIXTEEN_BY_NINE = 16 / 9;

export default async function createSwiper( container = '.swiper-container', params = {} ) {
	const autoSize = function() {
		const img = this.slides[ 0 ].querySelector( 'img ' );
		const aspectRatio = img.clientWidth / img.clientHeight;
		const sanityAspectRatio = Math.max( Math.min( aspectRatio, SIXTEEN_BY_NINE ), 1 );
		const sanityHeight = typeof window !== 'undefined' ? window.innerHeight * 0.8 : 600;
		const swiperHeight = Math.min( this.width / sanityAspectRatio, sanityHeight );
		this.$el[ 0 ].style.height = `${ Math.floor( swiperHeight ) }px`;
	};
	const init = function() {
		this.$el[ 0 ].classList.add( 'wp-swiper-initialized' );
		autoSize.call( this );
	};
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
		on: {
			init,
			imagesReady: autoSize,
			resize: autoSize,
		},
	};
	const [ { default: Swiper } ] = await Promise.all( [
		import( /* webpackChunkName: "swiper" */ 'swiper' ),
		import( /* webpackChunkName: "swiper" */ 'swiper/dist/css/swiper.css' ),
	] );
	return new Swiper( container, merge( {}, defaultParams, params ) );
}
