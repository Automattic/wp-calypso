/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import CustomerHome from '../../../main';
import type { SiteDetails } from '@automattic/data-stores';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn( ( flag ) => flag === 'home/launchpad-first' ),
} ) );

jest.mock( '../../../components/full-screen-launchpad', () => ( {
	FullScreenLaunchpad: ( { onClose }: { onClose: () => void } ) => (
		<div data-testid="launchpad">
			<button onClick={ onClose } data-testid="close-launchpad">
				Close Launchpad
			</button>
		</div>
	),
} ) );

jest.mock( '../../../components/home-content', () => () => (
	<div data-testid="home-content">Home Content</div>
) );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( str: string ) => str,
} ) );

jest.mock( 'calypso/components/main', () => ( { children }: { children: React.ReactNode } ) => (
	<div data-testid="main">{ children }</div>
) );

jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => () => null );

function makeTestSite( site: Partial< SiteDetails > = {} ): SiteDetails {
	return {
		ID: 1,
		title: 'Test Site',
		slug: 'https://example.com',
		URL: 'https://example.com',
		domain: 'example.com',
		launch_status: 'launched',
		options: { site_creation_flow: 'onboarding', launchpad_screen: false, ...site.options },
		...site,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} as any; // This partial site object should be good enough for testing purposes
}

describe( 'Make sure CustomerHome render traditional home or Focused Launchpad', () => {
	it( 'should show HomeContent for launched site', () => {
		const testSite = makeTestSite( { launch_status: 'launched' } );
		render( <CustomerHome site={ testSite } /> );

		expect( screen.getByTestId( 'home-content' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'launchpad' ) ).not.toBeInTheDocument();
	} );

	it( 'should show HomeContent for unlaunched site when launchpad is skipped', () => {
		const testSite = makeTestSite( {
			launch_status: 'unlaunched',
			options: { launchpad_screen: 'skipped' },
		} );
		render( <CustomerHome site={ testSite } /> );

		expect( screen.getByTestId( 'home-content' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'launchpad' ) ).not.toBeInTheDocument();
	} );

	it( 'should show Launchpad when site is unlaunched, created by onboarding flow, and launchpad is unskipped', async () => {
		const testSite = makeTestSite( {
			launch_status: 'unlaunched',
			options: { site_creation_flow: 'onboarding', launchpad_screen: false },
		} );
		render( <CustomerHome site={ testSite } /> );

		expect( screen.getByTestId( 'launchpad' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'home-content' ) ).not.toBeInTheDocument();

		// Click the close button
		await act( async () => {
			screen.getByTestId( 'close-launchpad' ).click();
		} );

		// Verify HomeContent is now shown
		expect( screen.getByTestId( 'home-content' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'launchpad' ) ).not.toBeInTheDocument();
	} );
} );
