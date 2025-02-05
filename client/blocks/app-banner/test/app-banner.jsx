/**
 * @jest-environment jsdom
 */

import { isMobile } from '@automattic/viewport';
import { screen, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import AppBanner, { getiOSDeepLink, buildDeepLinkFragment } from 'calypso/blocks/app-banner';
import {
	GUTENBERG,
	NOTES,
	READER,
	STATS,
	getCurrentSection,
} from 'calypso/blocks/app-banner/utils';

jest.mock( '@automattic/viewport' );

describe( 'when showing launchpad', () => {
	let originalWindowLocation;
	beforeAll( () => {
		originalWindowLocation = window.location;
		delete window.location;
		isMobile.mockReturnValue( true );
		window.location = {
			href: 'https://wordpress.com/?showLaunchpad=true',
		};
	} );

	afterAll( () => {
		isMobile.mockRestore();
		window.location = originalWindowLocation;
	} );

	test( 'renders nothing', () => {
		const mockStore = configureStore();
		const store = mockStore( {
			ui: {
				appBannerVisibility: true,
				layoutFocus: {
					current: 'not-sidebar',
				},
				section: {
					name: GUTENBERG,
				},
			},
			preferences: {
				remoteValues: [ 'something' ],
			},
		} );
		render(
			<Provider store={ store }>
				<AppBanner />
			</Provider>
		);

		expect( screen.queryByText( 'Rich mobile publishing.' ) ).toBeNull();
	} );
} );

describe( 'iOS deep link fragments', () => {
	test( 'properly encodes tricky fragments', () => {
		const funnyFragment = '?://&#';
		expect( buildDeepLinkFragment( funnyFragment, STATS ) ).toEqual(
			encodeURIComponent( funnyFragment )
		);
	} );

	test( 'returns a fragment for a null path', () => {
		expect( buildDeepLinkFragment( null, STATS ).length ).toBeTruthy();
	} );

	test( 'returns a fragment for each section', () => {
		[ STATS, READER, NOTES ].forEach( ( section ) =>
			expect( buildDeepLinkFragment( '/test', section ) ).toMatchSnapshot()
		);
	} );

	test( 'returns an empty fragment for other sections', () => {
		expect( buildDeepLinkFragment( 'test', 'example' ).length ).toBeFalsy();
	} );

	test( 'returns a valid Reader URI for the root of the Reader section', () => {
		expect( buildDeepLinkFragment( '/reader', READER ) ).toBe( '%2Fread' );
	} );

	test( 'passes through a non-root Reader path', () => {
		expect( buildDeepLinkFragment( '/reader/feeds/12345/posts/6789', READER ) ).toBe(
			encodeURIComponent( '/read/feeds/12345/posts/6789' )
		);
	} );

	test( 'passes through a Stats path', () => {
		const path = '/stats/day/discover.wordpress.com';
		expect( buildDeepLinkFragment( path, STATS ) ).toBe( encodeURIComponent( path ) );
	} );
} );

describe( 'iOS deep links', () => {
	test( 'returns a URI even if the path is null', () => {
		expect( getiOSDeepLink( null, STATS ) ).toBeTruthy();
	} );

	test( 'returns URIs for each path', () => {
		[ STATS, READER, NOTES ].forEach( ( section ) =>
			expect( getiOSDeepLink( '/test', section ) ).toMatchSnapshot()
		);
	} );

	test( 'includes fragment in URI', () => {
		expect( getiOSDeepLink( '/test', STATS ).includes( '#' ) ).toBeTruthy();
		expect( getiOSDeepLink( '/test', STATS ).split( '#' )[ 1 ].length ).toBeTruthy();
	} );
} );

describe( 'getCurrentSection', () => {
	test( 'returns stats if in stats section', () => {
		expect( getCurrentSection( STATS, false, '/stats/123' ) ).toBe( STATS );
	} );

	test( 'returns notes if notes is open', () => {
		expect( getCurrentSection( STATS, true, '/stats/123' ) ).toBe( NOTES );
	} );

	test( 'returns reader if in reader section', () => {
		expect( getCurrentSection( READER, false, '/' ) ).toBe( READER );
	} );

	test( 'returns null if in a disallowed section', () => {
		expect( getCurrentSection( 'plugins', false, '/plugins/123' ) ).toBe( null );
	} );
} );
