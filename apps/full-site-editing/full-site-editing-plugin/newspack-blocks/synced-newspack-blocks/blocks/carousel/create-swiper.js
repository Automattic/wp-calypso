/**
 * External dependencies
 */
import { speak } from '@wordpress/a11y';
import { escapeHTML } from '@wordpress/escape-html';
import { __, sprintf } from '@wordpress/i18n';
import Swiper from 'swiper';
import 'swiper/dist/css/swiper.css';

const autoplayClassName = 'wp-block-newspack-blocks-carousel__autoplay-playing';

/**
 * A helper for IE11-compatible iteration over NodeList elements.
 *
 * @param {object} nodeList List of nodes to be iterated over.
 * @param {Function} cb Invoked for each iteratee.
 */
function forEachNode( nodeList, cb ) {
	/**
	 * Calls Array.prototype.forEach for IE11 compatibility.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeList
	 */
	Array.prototype.forEach.call( nodeList, cb );
}

/**
 * Modifies attributes on slide HTML to make it accessible.
 *
 * @param {HTMLElement} slide Slide DOM element
 */
function activateSlide( slide ) {
	slide.setAttribute( 'aria-hidden', 'false' );
	forEachNode( slide.querySelectorAll( 'a' ), ( el ) => el.removeAttribute( 'tabindex' ) );
}

/**
 * Modifies attributes on slide HTML to make it accessible.
 *
 * @param {HTMLElement} slide Slide DOM element
 */
function deactivateSlide( slide ) {
	slide.setAttribute( 'aria-hidden', 'true' );
	forEachNode( slide.querySelectorAll( 'a' ), ( el ) => el.setAttribute( 'tabindex', '-1' ) );
}

/**
 * Creates a Swiper instance with predefined config used by the Articles
 * Carousel block in both front-end and editor.
 *
 * @param {object} els Swiper elements
 * @param {Element} els.block Block element
 * @param {Element} els.container Swiper container element
 * @param {Element} els.next Next button element
 * @param {Element} els.prev Previous button element
 * @param {Element} els.play Play button element
 * @param {Element} els.pause Pause button element
 * @param {Element} els.pagination Pagination element
 * @param {object} config Swiper config
 * @returns {object} Swiper instance
 */
export default function createSwiper( els, config = {} ) {
	const swiper = new Swiper( els.container, {
		/**
		 * Remove the messages, as we're announcing the slide content and number.
		 * These messages are overwriting the slide announcement.
		 */
		a11y: false,
		autoplay: !! config.autoplay && {
			delay: config.delay,
			disableOnInteraction: false,
		},
		effect: 'slide',
		grabCursor: true,
		init: false,
		initialSlide: config.initialSlide || 0,
		loop: true,
		navigation: {
			nextEl: els.next,
			prevEl: els.prev,
		},
		pagination: {
			bulletElement: 'button',
			clickable: true,
			el: els.pagination,
			type: 'bullets',
			renderBullet: ( index, className ) => {
				// Use a custom render, as Swiper's render is inaccessible.
				return `<button class="${ className }"><span>${ sprintf(
					__( 'Slide %s', 'full-site-editing' ),
					index + 1
				) }</span></button>`;
			},
		},
		preventClicksPropagation: false, // Necessary for normal block interactions.
		releaseFormElements: false,
		setWrapperSize: true,
		touchStartPreventDefault: false,
		on: {
			init() {
				forEachNode( this.wrapperEl.querySelectorAll( '.swiper-slide' ), ( slide ) =>
					deactivateSlide( slide )
				);

				activateSlide( this.slides[ this.activeIndex ] ); // Set-up our active slide.
			},

			slideChange() {
				const currentSlide = this.slides[ this.activeIndex ];

				deactivateSlide( this.slides[ this.previousIndex ] );

				activateSlide( currentSlide );

				/**
				 * If we're autoplaying, don't announce the slide change, as that would
				 * be supremely annoying.
				 */
				if ( ! this.autoplay.running ) {
					// Announce the contents of the slide.
					const currentImage = currentSlide.querySelector( 'img' );
					const alt = currentImage ? currentImage.alt : false;

					const slideInfo = sprintf(
						/* translators: current slide number and the total number of slides */
						__( 'Slide %s of %s', 'full-site-editing' ),
						this.realIndex + 1,
						this.pagination.bullets.length
					);

					speak(
						escapeHTML(
							`${ currentSlide.innerText },
							${ alt ? sprintf( __( 'Image: %s, ', 'full-site-editing' ), alt ) : '' }
							${ slideInfo }`
						),
						'assertive'
					);
				}
			},
		},
	} );

	if ( config.autoplay ) {
		/**
		 * Handles the Pause button click.
		 */
		function handlePauseButtonClick() {
			swiper.autoplay.stop();
			els.play.focus(); // Move focus to the play button.
		}

		/**
		 * Handles the Play button click.
		 */
		function handlePlayButtonClick() {
			swiper.autoplay.start();
			els.pause.focus(); // Move focus to the pause button.
		}

		swiper.on( 'init', function () {
			els.play.addEventListener( 'click', handlePlayButtonClick );
			els.pause.addEventListener( 'click', handlePauseButtonClick );
		} );

		swiper.on( 'autoplayStart', function () {
			els.block.classList.add( autoplayClassName ); // Hide play & show pause button.
			speak( __( 'Playing', 'full-site-editing' ), 'assertive' );
		} );

		swiper.on( 'autoplayStop', function () {
			els.block.classList.remove( autoplayClassName ); // Hide pause & show play button.
			speak( __( 'Paused', 'full-site-editing' ), 'assertive' );
		} );

		swiper.on( 'beforeDestroy', function () {
			els.play.removeEventListener( 'click', handlePlayButtonClick );
			els.pause.removeEventListener( 'click', handlePauseButtonClick );
		} );
	}

	swiper.init();

	return swiper;
}
