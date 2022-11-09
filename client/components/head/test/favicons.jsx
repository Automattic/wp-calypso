/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import Favicons from '../favicons';

jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud' );

describe( 'Favicons', () => {
	beforeEach( () => {
		isJetpackCloud.mockImplementation( () => false );
	} );

	afterEach( () => {
		isJetpackCloud.mockRestore();
	} );

	const findFavicon = ( links, { rel, type } ) =>
		links.find( ( el ) => el.rel === rel && el.type === type );

	const findFaviconBySizes = ( links, { rel, sizes } ) =>
		links.find( ( el ) => el.rel === rel && el.getAttribute( 'sizes' ) === sizes );

	test( "should render environment favicons using the 'environmentFaviconURL' property", () => {
		const arbitraryURL = 'https://arbitrary-favicon-url/';
		const { container } = render( <Favicons environmentFaviconURL={ arbitraryURL } /> );
		const links = Array.from( container.getElementsByTagName( 'link' ) );

		[
			{ rel: 'shortcut icon', type: 'image/vnd.microsoft.icon' },
			{ rel: 'shortcut icon', type: 'image/x-icon' },
			{ rel: 'icon', type: 'image/x-icon' },
		].forEach( ( params ) => {
			expect( findFavicon( links, params ) ).toHaveAttribute( 'href', arbitraryURL );
		} );
	} );

	test( 'should only render WordPress favicons if not running Jetpack Cloud', () => {
		const favicons = [
			// "Plain" favicons
			[ 'icon', 64, 'favicon-64x64.png' ],
			[ 'icon', 96, 'favicon-96x96.png' ],

			// Android favicon
			[ 'icon', 192, 'android-chrome-192x192.png' ],

			// Apple touch icons
			[ 'apple-touch-icon', 180, 'apple-touch-icon-180x180.png' ],
			[ 'apple-touch-icon', 152, 'apple-touch-icon-152x152.png' ],
			[ 'apple-touch-icon', 144, 'apple-touch-icon-144x144.png' ],
			[ 'apple-touch-icon', 120, 'apple-touch-icon-120x120.png' ],
			[ 'apple-touch-icon', 114, 'apple-touch-icon-114x114.png' ],
			[ 'apple-touch-icon', 76, 'apple-touch-icon-76x76.png' ],
			[ 'apple-touch-icon', 72, 'apple-touch-icon-72x72.png' ],
			[ 'apple-touch-icon', 60, 'apple-touch-icon-60x60.png' ],
			[ 'apple-touch-icon', 57, 'apple-touch-icon-57x57.png' ],
		];

		const baseUrl = '//s1.wp.com/i/favicons';

		expect( isJetpackCloud() ).toEqual( false );
		const { container } = render( <Favicons environmentFaviconURL="" /> );

		const links = Array.from( container.getElementsByTagName( 'link' ) );

		favicons.forEach( ( icon ) => {
			const [ rel, size, filename ] = icon;
			expect( findFaviconBySizes( links, { rel, sizes: `${ size }x${ size }` } ) ).toHaveAttribute(
				'href',
				`${ baseUrl }/${ filename }`
			);
		} );
	} );

	test( 'should only render Jetpack favicons if running Jetpack Cloud', () => {
		const basePath = '/calypso/images/jetpack/favicons';

		isJetpackCloud.mockImplementation( () => true );
		expect( isJetpackCloud() ).toEqual( true );
		const { container } = render( <Favicons environmentFaviconURL="" /> );

		const links = Array.from( container.getElementsByTagName( 'link' ) );
		const metas = Array.from( container.getElementsByTagName( 'meta' ) );

		// Safari pinned tab icon (foreground color should be Jetpack Green)
		const safariLink = links.find(
			( el ) => el.rel === 'mask-icon' && el.type === 'image/svg+xml'
		);
		expect( safariLink.getAttribute( 'color' ) ).toEqual( '#00be28' );
		expect( safariLink.getAttribute( 'href' ) ).toEqual( `${ basePath }/safari-pinned-tab.svg` );

		// Windows/IE tile
		expect(
			metas.find( ( meta ) => meta.name === 'application-name' ).getAttribute( 'content' )
		).toEqual( 'Jetpack.com' );
		expect(
			metas.find( ( meta ) => meta.name === 'msapplication-config' ).getAttribute( 'content' )
		).toEqual( `${ basePath }/browserconfig.xml` );

		// Android favicons
		expect( findFaviconBySizes( links, { rel: 'icon', sizes: '512x512' } ) ).toHaveAttribute(
			'href',
			expect.stringMatching( `${ basePath }/android-chrome-512x512.png` )
		);
		expect( findFaviconBySizes( links, { rel: 'icon', sizes: '192x192' } ) ).toHaveAttribute(
			'href',
			expect.stringMatching( `${ basePath }/android-chrome-192x192.png` )
		);

		// Apple touch icon
		expect(
			findFaviconBySizes( links, { rel: 'apple-touch-icon', sizes: '180x180' } )
		).toHaveAttribute( 'href', expect.stringContaining( `${ basePath }/apple-touch-icon.png` ) );
	} );
} );
