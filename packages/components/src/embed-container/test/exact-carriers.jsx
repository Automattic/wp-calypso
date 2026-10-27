/**
 * @jest-environment jsdom
 */
/* eslint-disable react/no-danger */
import { render, waitFor } from '@testing-library/react';

jest.mock( '@automattic/load-script', () => ( {
	loadScript: jest.fn(),
	loadjQueryDependentScript: jest.fn(),
} ) );

let EmbedContainer;
let loadScript;
let loadjQueryDependentScript;

beforeEach( () => {
	jest.resetModules();
	EmbedContainer = require( '../' ).default;
	( { loadScript, loadjQueryDependentScript } = require( '@automattic/load-script' ) );
} );

afterEach( () => {
	delete window.jQuery;
} );

const renderPost = ( html ) => {
	const { container } = render(
		<EmbedContainer>
			<div dangerouslySetInnerHTML={ { __html: html } } />
		</EmbedContainer>
	);
	return container;
};

describe( 'exact carriers from the HackerOne reports', () => {
	// READ-755 / report 4032455
	it( 'READ-755: Issuu data-configid cannot become an iframe onload', () => {
		const carrier =
			'<div id="attack" class="embed-issuu issuuembed" ' +
			"data-configid=\"safe&quot; onload=&quot;fetch('/private-marker').then(r=&gt;r.text()).then(t=&gt;{top.__wpcomReaderIssuuXss=t;return fetch('/collect?d='+encodeURIComponent(t))})&quot; x=&quot;\">" +
			'inert author content</div>';
		const container = renderPost( carrier );
		const value = container.querySelector( '#attack' ).getAttribute( 'data-configid' );

		// Replay the Issuu runtime's sink: interpolate into an HTML string, parse a second time.
		const host = document.createElement( 'div' );
		host.innerHTML = `<iframe src="https://e.issuu.com/embed#${ value }"></iframe>`;

		expect( value ).toBeNull();
		expect( host.firstElementChild.hasAttribute( 'onload' ) ).toBe( false );
	} );

	// READ-754 / report 4032453
	it( 'READ-754: Instagram data-instgrm-permalink cannot be a javascript: URL', () => {
		const carrier =
			'<blockquote id="attack" class="instagram-media" ' +
			'data-instgrm-permalink="javascript:fetch(&apos;/private-marker&apos;).then(r=&gt;r.text()).then(t=&gt;{parent.__wpcomReaderInstagramXss=t;fetch(&apos;/collect/&apos;+encodeURIComponent(t))});//">' +
			'inert author content</blockquote>';
		const container = renderPost( carrier );
		const value = container.querySelector( '#attack' ).getAttribute( 'data-instgrm-permalink' );

		expect( value ).toBeNull();
		// Replay the runtime's builder on whatever is left.
		const built = `${ String( value ).replace( /^(.*?)\/?(\?.*|#|$)/, '$1/' ) }embed/`;
		expect( built.startsWith( 'javascript:' ) ).toBe( false );
	} );

	// READ-753 / report 4032482
	it( 'READ-753: Jetpack slideshow caption cannot build an element', async () => {
		let galleryAtInit = null;
		loadScript.mockImplementation( ( url, cb ) => cb() );
		loadjQueryDependentScript.mockImplementation( ( url, cb ) => cb() );
		const jQuery = jest.fn( () => ( {
			trigger: () => {
				galleryAtInit = document
					.querySelector( '.jetpack-slideshow' )
					.getAttribute( 'data-gallery' );
			},
		} ) );
		jQuery.prototype.cycle = () => {};
		window.jQuery = jQuery;

		const caption =
			'<img src="/missing-reader-slideshow-caption" onerror="fetch(\'/private-marker\').then(r=>r.text()).then(t=>fetch(\'/collect?d=\'+t))">';
		const gallery = JSON.stringify( [
			{ src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', caption },
		] )
			.replace( /&/g, '&amp;' )
			.replace( /</g, '&lt;' )
			.replace( />/g, '&gt;' )
			.replace( /"/g, '&quot;' );

		renderPost( `<div class="jetpack-slideshow" data-gallery="${ gallery }"></div>` );
		await waitFor( () => expect( galleryAtInit ).not.toBeNull() );

		// Replay the shortcode script's sink: caption.innerHTML = imageInfo.caption
		const slide = JSON.parse( galleryAtInit )[ 0 ];
		const host = document.createElement( 'div' );
		host.innerHTML = slide.caption;

		expect( host.querySelectorAll( '*' ) ).toHaveLength( 0 );
		expect( host.innerHTML ).not.toContain( 'onerror' );
	} );
} );
