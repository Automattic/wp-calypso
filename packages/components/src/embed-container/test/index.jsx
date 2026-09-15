/**
 * @jest-environment jsdom
 */

import { render, waitFor } from '@testing-library/react';
import EmbedContainer from '../index';

jest.mock( '@automattic/load-script', () => ( {
	loadScript: ( url, callback ) => callback(),
	loadjQueryDependentScript: ( url, callback ) => callback(),
} ) );

/**
 * Build the `data-gallery` attribute Jetpack's slideshow shortcode emits: JSON, with the characters
 * that matter to the HTML parser encoded as entities. Nothing in the result is a literal element,
 * so it reaches the Reader intact.
 * @param {Array} gallery - Slides to encode.
 * @returns {string} Post markup holding a slideshow container.
 */
function slideshowMarkup( gallery ) {
	const attribute = JSON.stringify( gallery )
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#039;' );

	return `<div class="jetpack-slideshow" data-trans="fade" data-autostart="false" data-gallery="${ attribute }"></div>`;
}

/**
 * JetpackSlideshow has historically built slide captions with innerHTML, so a caption is only safe
 * if it stays text through that too.
 * @param {string} caption - A caption from sanitized gallery data.
 * @returns {Element} An element the caption was rendered into as HTML.
 */
function renderCaptionAsHtml( caption ) {
	const element = document.createElement( 'div' );
	element.innerHTML = caption;
	return element;
}

describe( 'EmbedContainer', () => {
	describe( 'Jetpack slideshows', () => {
		// The gallery data of each slideshow as JetpackSlideshow sees it, read when the slideshow
		// script is told to initialize. That is the last moment at which sanitizing still helps.
		let galleriesAtInit;

		const renderPost = ( markup ) =>
			render(
				<EmbedContainer>
					{ /* eslint-disable-next-line react/no-danger */ }
					<div dangerouslySetInnerHTML={ { __html: markup } } />
				</EmbedContainer>
			);

		const renderSlideshows = async ( ...galleries ) => {
			galleries.forEach( ( gallery ) => renderPost( slideshowMarkup( gallery ) ) );
			await waitFor( () => expect( galleriesAtInit ).not.toBeNull() );
		};

		beforeEach( () => {
			galleriesAtInit = null;

			const jQuery = jest.fn( () => ( {
				trigger: () => {
					galleriesAtInit = Array.from( document.querySelectorAll( '.jetpack-slideshow' ) ).map(
						( node ) => node.getAttribute( 'data-gallery' )
					);
				},
			} ) );
			jQuery.prototype.cycle = () => {};
			window.jQuery = jQuery;
		} );

		afterEach( () => {
			delete window.jQuery;
			delete window.__captionHandlerFired;
		} );

		it( 'keeps a caption readable', async () => {
			await renderSlideshows( [
				{ src: 'https://example.com/1.jpg', caption: 'A view of the harbour' },
			] );

			const [ slide ] = JSON.parse( galleriesAtInit[ 0 ] );
			expect( renderCaptionAsHtml( slide.caption ).textContent ).toBe( 'A view of the harbour' );
		} );

		it( 'keeps the entities wptexturize() leaves in a caption readable', async () => {
			await renderSlideshows( [
				{ src: 'https://example.com/1.jpg', caption: 'The harbour&#8217;s best view' },
			] );

			const [ slide ] = JSON.parse( galleriesAtInit[ 0 ] );
			expect( renderCaptionAsHtml( slide.caption ).textContent ).toBe( 'The harbour’s best view' );
		} );

		it( 'leaves no markup in a caption for the slideshow script to build elements from', async () => {
			await renderSlideshows( [
				{
					src: 'https://example.com/1.jpg',
					caption:
						'The harbour <img src="/missing" onerror="window.__captionHandlerFired = true;"> at dawn',
				},
			] );

			const [ slide ] = JSON.parse( galleriesAtInit[ 0 ] );
			const rendered = renderCaptionAsHtml( slide.caption );
			expect( rendered.querySelector( 'img' ) ).toBeNull();
			expect( rendered.innerHTML ).not.toContain( 'onerror' );
			expect( rendered.textContent ).toBe( 'The harbour  at dawn' );
			expect( window.__captionHandlerFired ).toBeUndefined();
		} );

		it( 'sanitizes every slideshow on the page, not only the one being processed', async () => {
			await renderSlideshows(
				[ { src: 'https://example.com/1.jpg', caption: 'A view of the harbour' } ],
				[
					{
						src: 'https://example.com/2.jpg',
						caption: '<img src="/missing" onerror="window.__captionHandlerFired = true;">',
					},
				]
			);

			expect( galleriesAtInit ).toHaveLength( 2 );
			galleriesAtInit.forEach( ( gallery ) => {
				JSON.parse( gallery ).forEach( ( slide ) => {
					expect( renderCaptionAsHtml( slide.caption ).querySelector( 'img' ) ).toBeNull();
				} );
			} );
		} );

		it( 'drops gallery data that is not a list of slides', async () => {
			renderPost( '<div class="jetpack-slideshow" data-gallery="not json"></div>' );
			await waitFor( () => expect( galleriesAtInit ).not.toBeNull() );

			expect( galleriesAtInit ).toEqual( [ null ] );
		} );
	} );
} );
