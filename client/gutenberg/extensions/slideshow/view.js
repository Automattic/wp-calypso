/**
 * External dependencies
 */
import { forEach } from 'lodash';
import ResizeObserver from 'resize-observer-polyfill';

/**
 * Internal dependencies
 */
import createSwiper from './create-swiper';
import {
	swiperApplyAria,
	swiperInit,
	swiperPaginationRender,
	swiperResize,
} from './swiper-callbacks';

typeof window !== 'undefined' &&
	window.addEventListener( 'load', function() {
		const slideshowBlocks = document.getElementsByClassName( 'wp-block-jetpack-slideshow' );
		forEach( slideshowBlocks, slideshowBlock => {
			const { autoplay, delay, effect } = slideshowBlock.dataset;
			const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
			const shouldAutoplay = autoplay && ! prefersReducedMotion;
			const slideshowContainer = slideshowBlock.getElementsByClassName( 'swiper-container' )[ 0 ];
			let pendingRequestAnimationFrame = null;
			createSwiper(
				slideshowContainer,
				{
					autoplay: shouldAutoplay
						? {
								delay: delay * 1000,
								disableOnInteraction: false,
						  }
						: false,
					effect,
					init: true,
					initialSlide: 0,
					loop: true,
					keyboard: {
						enabled: true,
						onlyInViewport: true,
					},
				},
				{
					init: swiperInit,
					imagesReady: swiperResize,
					paginationRender: swiperPaginationRender,
					transitionEnd: swiperApplyAria,
				}
			)
				.then( swiper => {
					new ResizeObserver( () => {
						if ( pendingRequestAnimationFrame ) {
							cancelAnimationFrame( pendingRequestAnimationFrame );
							pendingRequestAnimationFrame = null;
						}
						pendingRequestAnimationFrame = requestAnimationFrame( () => {
							swiperResize( swiper );
							swiper.update();
						} );
					} ).observe( swiper.el );
				} )
				.catch( () => {
					slideshowBlock
						.querySelector( '.wp-block-jetpack-slideshow_container' )
						.classList.add( 'wp-swiper-initialized' );
				} );
		} );
	} );
