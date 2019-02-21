/**
 * External dependencies
 */
import { forEach } from 'lodash';

const SIXTEEN_BY_NINE = 16 / 9;
const MAX_HEIGHT_PERCENT_OF_WINDOW_HEIGHT = 0.8;
const SANITY_MAX_HEIGHT = 600;

function swiperInit( swiper ) {
	swiperResize( swiper );
	swiperApplyAria( swiper );
}

function swiperResize( swiper ) {
	const img = swiper.el.querySelector( '.swiper-slide[data-swiper-slide-index="0"] img' );
	if ( ! img ) {
		return;
	}
	const aspectRatio = img.clientWidth / img.clientHeight;
	const sanityAspectRatio = Math.max( Math.min( aspectRatio, SIXTEEN_BY_NINE ), 1 );
	const sanityHeight =
		typeof window !== 'undefined'
			? window.innerHeight * MAX_HEIGHT_PERCENT_OF_WINDOW_HEIGHT
			: SANITY_MAX_HEIGHT;
	const swiperHeight = Math.min( swiper.width / sanityAspectRatio, sanityHeight );
	const wrapperHeight = `${ Math.floor( swiperHeight ) }px`;
	const buttonTop = `${ Math.floor( swiperHeight / 2 ) }px`;

	swiper.el.classList.add( 'wp-swiper-initialized' );
	swiper.wrapperEl.style.height = wrapperHeight;
	swiper.el.querySelector( '.wp-block-jetpack-slideshow_button-prev' ).style.top = buttonTop;
	swiper.el.querySelector( '.wp-block-jetpack-slideshow_button-next' ).style.top = buttonTop;
}

function swiperApplyAria( swiper ) {
	forEach( swiper.slides, ( slide, index ) => {
		slide.setAttribute( 'aria-hidden', index === swiper.activeIndex ? 'false' : 'true' );
		slide.setAttribute( 'tabindex', index === swiper.activeIndex ? '-1' : '0' );
	} );
}

function swiperPaginationRender( swiper ) {
	forEach( swiper.pagination.bullets, bullet => {
		bullet.addEventListener( 'click', () => {
			const currentSlide = swiper.slides[ swiper.realIndex ];
			setTimeout( () => {
				currentSlide.focus();
			}, 1000 );
		} );
	} );
}

export { swiperApplyAria, swiperInit, swiperPaginationRender, swiperResize };
