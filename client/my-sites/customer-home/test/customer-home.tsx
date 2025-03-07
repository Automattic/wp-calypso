/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';
import nock from 'nock';
import React, { act } from 'react';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import CustomerHome from '../main';
import type { SiteDetails } from '@automattic/data-stores';

jest.mock( '@wordpress/api-fetch' );

jest.mock( '../components/home-content', () => () => (
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
		slug: 'example.com',
		URL: 'https://example.com',
		domain: 'example.com',
		launch_status: 'launched',
		...site,
		options: {
			site_creation_flow: 'onboarding',
			launchpad_screen: false,
			created_at: '2025-02-17T00:00:00+00:00',
			...site.options,
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} as any; // This partial site object should be good enough for testing purposes
}

describe( 'CustomerHome', () => {
	beforeEach( () => {
		nock.disableNetConnect();
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	it( 'should show HomeContent for launched site', async () => {
		const testSite = makeTestSite( { launch_status: 'launched' } );

		renderWithProvider( <CustomerHome site={ testSite } /> );

		await waitFor( () => expect( screen.getByTestId( 'home-content' ) ).toBeInTheDocument() );
		expect( screen.queryByTestId( 'launchpad-first' ) ).not.toBeInTheDocument();
	} );

	it( 'should show HomeContent for unlaunched site when launchpad is skipped', async () => {
		const testSite = makeTestSite( {
			launch_status: 'unlaunched',
			options: { launchpad_screen: 'skipped' },
		} );

		renderWithProvider( <CustomerHome site={ testSite } /> );

		await waitFor( () => expect( screen.getByTestId( 'home-content' ) ).toBeInTheDocument() );
		expect( screen.queryByTestId( 'launchpad-first' ) ).not.toBeInTheDocument();
	} );

	it( 'should show Launchpad when site is unlaunched, created by onboarding flow, and launchpad is unskipped', async () => {
		const testSite = makeTestSite( {
			launch_status: 'unlaunched',
			options: { site_creation_flow: 'onboarding', launchpad_screen: false },
		} );

		renderWithProvider( <CustomerHome site={ testSite } /> );

		await waitFor( () => expect( screen.getByTestId( 'launchpad-first' ) ).toBeInTheDocument() );
		expect( screen.queryByTestId( 'home-content' ) ).not.toBeInTheDocument();

		// Click the close button
		act( () => {
			screen.getByText( 'Skip to dashboard' ).click();
		} );

		// Verify HomeContent is now shown
		expect( screen.getByTestId( 'home-content' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'launchpad-first' ) ).not.toBeInTheDocument();
	} );

	it( 'should show the site launched modal once the site is launched', async () => {
		const testSite = makeTestSite( {
			launch_status: 'unlaunched',
			options: { site_creation_flow: 'onboarding', site_intent: 'write', launchpad_screen: false },
		} );

		nock( 'https://public-api.wordpress.com' ).get( '/wpcom/v2/sites/1/home/layout' ).reply( 200, {
			primary: [],
			secondary: [],
		} );

		const data = {
			checklist_statuses: {
				design_completed: true,
				site_theme_selected: true,
				site_launched: false,
				site_edited: true,
			},
			launchpad_screen: 'full',
			site_intent: 'write',
			checklist: [
				{
					id: 'site_launched',
					isLaunchTask: true,
					title: 'Launch your site',
					completed: false,
				},
			],
		};

		jest.mocked( apiFetch ).mockResolvedValue( data );

		renderWithProvider( <CustomerHome site={ testSite } />, {
			reducers: { ui },
			initialState: {
				sites: {
					items: {
						[ testSite.ID ]: testSite,
					},
				},
				ui: {
					selectedSiteId: testSite.ID,
				},
			},
		} );

		const launchSiteButton = await screen.findByRole( 'button', { name: 'Launch your site' } );

		// Click the Launch site button
		act( () => launchSiteButton.click() );

		expect( await screen.findByText( 'Congrats, your site is live!' ) ).toBeInTheDocument();
	} );
} );
