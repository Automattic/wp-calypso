/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import React, { act } from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import CustomerHome from '../../../main';
import type { SiteDetails } from '@automattic/data-stores';

jest.mock( '@automattic/calypso-config', () => {
	const config = () => 'development';
	config.isEnabled = ( property: string ) => property === 'home/launchpad-first';
	return config;
} );

jest.mock( '../../../components/home-content', () => () => (
	<div data-testid="home-content">Home Content</div>
) );

jest.mock( 'calypso/landing/stepper/utils/skip-launchpad', () => ( {
	skipLaunchpad: jest.fn(),
} ) );

jest.mock( 'calypso/state/sites/actions', () => ( {
	requestSite: jest.fn().mockReturnValue( () => {} ),
} ) );

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

		renderWithProvider( <CustomerHome site={ testSite } /> );

		expect( screen.getByTestId( 'home-content' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'launchpad-first' ) ).not.toBeInTheDocument();
	} );

	it( 'should show HomeContent for unlaunched site when launchpad is skipped', () => {
		const testSite = makeTestSite( {
			launch_status: 'unlaunched',
			options: { launchpad_screen: 'skipped' },
		} );

		renderWithProvider( <CustomerHome site={ testSite } /> );

		expect( screen.getByTestId( 'home-content' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'launchpad-first' ) ).not.toBeInTheDocument();
	} );

	it( 'should show Launchpad when site is unlaunched, created by onboarding flow, and launchpad is unskipped', async () => {
		const testSite = makeTestSite( {
			launch_status: 'unlaunched',
			options: { site_creation_flow: 'onboarding', launchpad_screen: false },
		} );

		renderWithProvider( <CustomerHome site={ testSite } /> );

		expect( screen.getByTestId( 'launchpad-first' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'home-content' ) ).not.toBeInTheDocument();

		// Click the close button
		act( () => {
			screen.getByText( 'Skip to dashboard' ).click();
		} );

		// Verify HomeContent is now shown
		expect( screen.getByTestId( 'home-content' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'launchpad-first' ) ).not.toBeInTheDocument();
	} );
} );
