/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import AppsDesktopCard from '../apps-desktop-card';

const setUserAgentData = ( value: unknown ) => {
	Object.defineProperty( window.navigator, 'userAgentData', {
		value,
		writable: true,
		configurable: true,
	} );
};

const setNavigatorPlatform = ( value: string ) => {
	Object.defineProperty( window.navigator, 'platform', {
		value,
		writable: true,
		configurable: true,
	} );
};

describe( 'AppsDesktopCard', () => {
	const originalNavigator = global.navigator;

	afterEach( () => {
		Object.defineProperty( global, 'navigator', {
			value: originalNavigator,
			writable: true,
			configurable: true,
		} );
	} );

	it( 'shows a single download button when architecture is detected via Client Hints', async () => {
		setUserAgentData( {
			brands: [],
			mobile: false,
			platform: 'macOS',
			getHighEntropyValues: jest.fn().mockResolvedValue( {
				platform: 'macOS',
				architecture: 'arm64',
				bitness: '64',
			} ),
		} );

		render( <AppsDesktopCard appSlug="wordpress" /> );

		const button = await screen.findByRole( 'link', {
			name: /Download for Mac \(Apple Silicon\)/,
		} );
		expect( button ).toHaveAttribute(
			'href',
			'https://apps.wordpress.com/d/osx-silicon?ref=getapps'
		);

		// The other architecture of the same group moves to "Also available for".
		expect( screen.getByText( 'Also available for:' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Mac (Intel)' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'link', { name: /Download for Mac \(Intel\)/ } )
		).not.toBeInTheDocument();
	} );

	it( 'shows one button per architecture when detection falls back to navigator.platform', async () => {
		setUserAgentData( undefined );
		setNavigatorPlatform( 'Win32' );

		render( <AppsDesktopCard appSlug="studio" /> );

		const x64Button = await screen.findByRole( 'link', { name: /Download for Windows \(x64\)/ } );
		expect( x64Button ).toHaveAttribute(
			'href',
			'https://appscdn.wordpress.com/downloads/wordpress-com-studio/windows-x64/latest'
		);

		const armButton = screen.getByRole( 'link', { name: /Download for Windows on ARM/ } );
		expect( armButton ).toHaveAttribute(
			'href',
			'https://appscdn.wordpress.com/downloads/wordpress-com-studio/windows-arm64/latest'
		);
	} );

	it( 'falls back to the generic Linux entry for apps without arch-specific Linux builds', async () => {
		setUserAgentData( {
			brands: [],
			mobile: false,
			platform: 'Linux',
			getHighEntropyValues: jest.fn().mockResolvedValue( {
				platform: 'Linux',
				architecture: 'x86',
				bitness: '64',
			} ),
		} );

		render( <AppsDesktopCard appSlug="wordpress" /> );

		const button = await screen.findByRole( 'link', { name: /Download for Linux \(.tar.gz\)/ } );
		expect( button ).toHaveAttribute( 'href', 'https://apps.wordpress.com/d/linux?ref=getapps' );
	} );

	it( 'shows a visit-on-desktop message instead of download buttons on mobile devices', async () => {
		setUserAgentData( {
			brands: [],
			mobile: true,
			platform: 'Android',
			getHighEntropyValues: jest.fn().mockResolvedValue( {
				platform: 'Android',
				architecture: 'arm64',
				bitness: '64',
			} ),
		} );

		render( <AppsDesktopCard appSlug="wordpress" /> );

		expect( await screen.findByText( /on your desktop/ ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /Download for/ } ) ).not.toBeInTheDocument();
	} );
} );
