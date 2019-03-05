/**
 * External dependencies
 */
import { forEach } from 'lodash';

const SIXTEEN_BY_NINE = 16 / 9;
const MAX_HEIGHT_PERCENT_OF_WINDOW_HEIGHT = 0.8;
const SANITY_MAX_HEIGHT = 600;
const PAUSE_CLASS = 'wp-block-jetpack-slideshow_autoplay-paused';

function swiperInit( swiper ) {
	swiperResize( swiper );
	swiperApplyAria( swiper );
	swiper.el
		.querySelector( '.wp-block-jetpack-slideshow_button-pause' )
		.addEventListener( 'click', function() {
			// Handle destroyed Swiper instances
			if ( ! swiper.el ) {
				return;
			}
			if ( swiper.el.classList.contains( PAUSE_CLASS ) ) {
				swiper.el.classList.remove( PAUSE_CLASS );
				swiper.autoplay.start();
				this.setAttribute( 'aria-label', 'Pause Slideshow' );
			} else {
				swiper.el.classList.add( PAUSE_CLASS );
				swiper.autoplay.stop();
				this.setAttribute( 'aria-label', 'Play Slideshow' );
			}
		} );
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

function announceCurrentSlide( swiper ) {
	const currentSlide = swiper.slides[ swiper.activeIndex ];
	const figcaption = currentSlide.getElementsByTagName( 'FIGCAPTION' )[ 0 ];
	const img = currentSlide.getElementsByTagName( 'IMG' )[ 0 ];
	const notification = figcaption ? figcaption.innerText : img.alt;
	swiper.a11y.notify( notification );
}

function swiperApplyAria( swiper ) {
	forEach( swiper.slides, ( slide, index ) => {
		slide.setAttribute( 'aria-hidden', index === swiper.activeIndex ? 'false' : 'true' );
		if ( index === swiper.activeIndex ) {
			slide.setAttribute( 'tabindex', '-1' );
		} else {
			slide.removeAttribute( 'tabindex' );
		}
	} );
	announceCurrentSlide( swiper );
}

function swiperPaginationRender( swiper ) {
	forEach( swiper.pagination.bullets, bullet => {
		bullet.addEventListener( 'click', () => {
			const currentSlide = swiper.slides[ swiper.realIndex ];
			setTimeout( () => {
				currentSlide.focus();
			}, 500 );
		} );
	} );
}

export { swiperApplyAria, swiperInit, swiperPaginationRender, swiperResize };
