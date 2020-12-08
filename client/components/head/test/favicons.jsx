/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
jest.mock( 'lib/jetpack/is-jetpack-cloud' );
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import Favicons from '../favicons';

describe( 'Favicons', () => {
	beforeEach( () => {
		isJetpackCloud.mockImplementation( () => false );
	} );

	afterEach( () => {
		isJetpackCloud.mockRestore();
	} );

	const findFaviconURL = ( wrapper, props ) =>
		wrapper.find( { type: 'image/png', ...props } ).prop( 'href' );

	test( "should render environment favicons using the 'environmentFaviconURL' property", () => {
		const arbitraryURL = 'https://arbitrary-favicon-url/';

		const wrapper = shallow( <Favicons environmentFaviconURL={ arbitraryURL } /> );

		expect( wrapper ).toMatchSnapshot();

		expect(
			findFaviconURL( wrapper, { rel: 'shortcut icon', type: 'image/vnd.microsoft.icon' } )
		).toEqual( arbitraryURL );
		expect( findFaviconURL( wrapper, { rel: 'shortcut icon', type: 'image/x-icon' } ) ).toEqual(
			arbitraryURL
		);
		expect( findFaviconURL( wrapper, { rel: 'icon', type: 'image/x-icon' } ) ).toEqual(
			arbitraryURL
		);
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
		const wrapper = shallow( <Favicons environmentFaviconURL="" /> );

		expect( wrapper ).toMatchSnapshot();

		favicons.forEach( ( icon ) => {
			const [ rel, size, filename ] = icon;
			expect( findFaviconURL( wrapper, { rel, sizes: `${ size }x${ size }` } ) ).toEqual(
				`${ baseUrl }/${ filename }`
			);
		} );
	} );

	test( 'should only render Jetpack favicons if running Jetpack Cloud', () => {
		const basePath = '/calypso/images/jetpack/favicons';

		isJetpackCloud.mockImplementation( () => true );
		expect( isJetpackCloud() ).toEqual( true );
		const wrapper = shallow( <Favicons environmentFaviconURL="" /> );

		expect( wrapper ).toMatchSnapshot();

		// Safari pinned tab icon (foreground color should be Jetpack Green)
		const safariLink = wrapper.find( { rel: 'mask-icon', type: 'image/svg+xml' } );
		expect( safariLink.prop( 'color' ) ).toEqual( '#00be28' );
		expect( safariLink.prop( 'href' ) ).toEqual( `${ basePath }/safari-pinned-tab.svg` );

		// Windows/IE tile
		expect( wrapper.find( 'meta' ).find( { name: 'application-name' } ).prop( 'content' ) ).toEqual(
			'Jetpack.com'
		);
		expect(
			wrapper.find( 'meta' ).find( { name: 'msapplication-config' } ).prop( 'content' )
		).toEqual( `${ basePath }/browserconfig.xml` );

		// Android favicons
		expect( findFaviconURL( wrapper, { rel: 'icon', sizes: '512x512' } ) ).toEqual(
			`${ basePath }/android-chrome-512x512.png`
		);
		expect( findFaviconURL( wrapper, { rel: 'icon', sizes: '192x192' } ) ).toEqual(
			`${ basePath }/android-chrome-192x192.png`
		);

		// Apple touch icon
		expect( findFaviconURL( wrapper, { rel: 'apple-touch-icon', sizes: '180x180' } ) ).toEqual(
			`${ basePath }/apple-touch-icon.png`
		);
	} );
} );
