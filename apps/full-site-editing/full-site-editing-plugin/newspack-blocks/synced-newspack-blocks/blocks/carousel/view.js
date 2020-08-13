/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';

/**
 * Internal dependencies
 */
import createSwiper from './create-swiper';
import './view.scss';

if ( typeof window !== 'undefined' ) {
	domReady( () => {
		const blocksArray = Array.from(
			document.querySelectorAll( '.wp-block-newspack-blocks-carousel' )
		);
		blocksArray.forEach( ( block ) => {
			createSwiper(
				{
					block,
					container: block.querySelector( '.swiper-container' ),
					prev: block.querySelector( '.swiper-button-prev' ),
					next: block.querySelector( '.swiper-button-next' ),
					pagination: block.querySelector( '.swiper-pagination-bullets' ),
					pause: block.querySelector( '.swiper-button-pause' ),
					play: block.querySelector( '.swiper-button-play' ),
				},
				{
					autoplay: !! parseInt( block.dataset.autoplay ),
					delay: parseInt( block.dataset.autoplay_delay ) * 1000,
				}
			);
		} );
	} );
}
