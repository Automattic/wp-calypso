/**
 * @jest-environment jsdom
 */
/* eslint-disable react/no-danger -- the point of these tests is to feed the component raw post markup. */
import { render } from '@testing-library/react';
import EmbedContainer from '../';

jest.mock( '@automattic/load-script', () => ( {
	loadScript: jest.fn(),
	loadjQueryDependentScript: jest.fn(),
} ) );

const { loadScript } = jest.requireMock( '@automattic/load-script' );

const INSTAGRAM_SCRIPT = 'https://platform.instagram.com/en_US/embeds.js';
const INSTAGRAM_PERMALINK = 'https://www.instagram.com/p/BnMO9vRleEx/';
const JAVASCRIPT_URL = 'javascript:fetch( "/me" ).then( ( r ) => r.text() )//';

function renderContent( content ) {
	const { container } = render(
		<EmbedContainer>
			<div dangerouslySetInnerHTML={ { __html: content } } />
		</EmbedContainer>
	);
	return container;
}

function loadedScripts() {
	return loadScript.mock.calls.map( ( [ url ] ) => url );
}

describe( 'EmbedContainer', () => {
	beforeEach( () => {
		loadScript.mockClear();
	} );

	describe( 'Instagram embeds', () => {
		it( 'keeps a canonical Instagram permalink and hands the embed to the provider script', () => {
			const container = renderContent(
				`<blockquote class="instagram-media" data-instgrm-permalink="${ INSTAGRAM_PERMALINK }">post</blockquote>`
			);

			expect(
				container.querySelector( 'blockquote' ).getAttribute( 'data-instgrm-permalink' )
			).toBe( INSTAGRAM_PERMALINK );
			expect( loadedScripts() ).toContain( INSTAGRAM_SCRIPT );
		} );

		it( 'drops a javascript: permalink', () => {
			const container = renderContent(
				`<blockquote class="instagram-media" data-instgrm-permalink="${ JAVASCRIPT_URL }">post</blockquote>`
			);

			expect(
				container.querySelector( 'blockquote' ).hasAttribute( 'data-instgrm-permalink' )
			).toBe( false );
		} );

		it( 'drops a javascript: permalink hidden behind leading whitespace', () => {
			const container = renderContent(
				`<blockquote class="instagram-media" data-instgrm-permalink="  &#9;&#10;${ JAVASCRIPT_URL }">post</blockquote>`
			);

			expect(
				container.querySelector( 'blockquote' ).hasAttribute( 'data-instgrm-permalink' )
			).toBe( false );
		} );

		it( 'drops a permalink pointing away from Instagram', () => {
			const container = renderContent(
				'<blockquote class="instagram-media" data-instgrm-permalink="https://example.com/p/1/">post</blockquote>'
			);

			expect(
				container.querySelector( 'blockquote' ).hasAttribute( 'data-instgrm-permalink' )
			).toBe( false );
		} );

		it( 'drops a javascript: permalink on a node the provider scans but we do not process', () => {
			// `blockquote[class^="instagram-"]` misses this node, but Instagram's own
			// `.instagram-media` scan of the document does not.
			const container = renderContent(
				`<blockquote class="wp-block-embed instagram-media" data-instgrm-permalink="${ JAVASCRIPT_URL }">post</blockquote>`
			);

			expect(
				container.querySelector( 'blockquote' ).hasAttribute( 'data-instgrm-permalink' )
			).toBe( false );
		} );

		it( 'cleans every content root, not just the one holding a recognised embed', () => {
			const { container } = render(
				<EmbedContainer>
					<div
						dangerouslySetInnerHTML={ {
							__html: `<blockquote class="instagram-media" data-instgrm-permalink="${ INSTAGRAM_PERMALINK }">real</blockquote>`,
						} }
					/>
					<div
						dangerouslySetInnerHTML={ {
							__html: `<blockquote class="instagram-media" data-instgrm-permalink="${ JAVASCRIPT_URL }">attack</blockquote>`,
						} }
					/>
				</EmbedContainer>
			);

			const permalinks = Array.from( container.querySelectorAll( '[data-instgrm-permalink]' ) ).map(
				( node ) => node.getAttribute( 'data-instgrm-permalink' )
			);
			expect( permalinks ).toEqual( [ INSTAGRAM_PERMALINK ] );
		} );
	} );

	describe( 'other provider embeds', () => {
		it.each( [
			[ 'data-href', '<div class="fb-post" data-href="%s"></div>', 'https://www.facebook.com/p/1' ],
			[
				'data-url',
				'<div class="calendly-inline-widget" data-url="%s"></div>',
				'https://calendly.com/example',
			],
			[
				'cite',
				'<blockquote class="tiktok-embed embed-tiktok" cite="%s"></blockquote>',
				'https://www.tiktok.com/@example/video/1',
			],
		] )( 'drops a javascript: %s but keeps an https one', ( attribute, markup, safeUrl ) => {
			const unsafe = renderContent( markup.replace( '%s', JAVASCRIPT_URL ) );
			expect( unsafe.querySelector( `[${ attribute }]` ) ).toBeNull();

			const safe = renderContent( markup.replace( '%s', safeUrl ) );
			expect( safe.querySelector( `[${ attribute }]` ).getAttribute( attribute ) ).toBe( safeUrl );
		} );
	} );
} );
