/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import LaunchpadPreLaunch from '../pre-launch';

jest.mock( 'wpcom-proxy-request', () => ( {
	...jest.requireActual( 'wpcom-proxy-request' ),
} ) );

jest.mock( '@wordpress/api-fetch' );

const site = {
	ID: 1,
	URL: 'example.wordpress.com',
	slug: 'example.wordpress.com',
	launch_status: 'unlaunched',
	capabilities: { manage_options: true },
	plan: { product_slug: 'free_plan', is_free: true },
	options: { site_intent: 'build' },
};

const render = () =>
	renderWithProvider( <LaunchpadPreLaunch />, {
		initialState: {
			sites: { items: { 1: site }, domains: { items: [ 'example.wordpress.com' ] } },
			ui: { selectedSiteId: 1 },
			currentUser: { id: 12, user: { email_verified: true } },
		},
		reducers: { ui },
	} );

// ExPlat reads a cached assignment from localStorage before asking the server.
const assignPublishCopyVariation = ( variationName: string ) =>
	window.localStorage.setItem(
		'explat-experiment--calypso_site_launch_publish_copy_202610_v1',
		JSON.stringify( {
			experimentName: 'calypso_site_launch_publish_copy_202610_v1',
			variationName,
			retrievedTimestamp: Date.now(),
			ttl: 3600,
		} )
	);

describe( 'LaunchpadPreLaunch', () => {
	beforeEach( () => {
		jest.mocked( apiFetch ).mockResolvedValue( {
			site_intent: 'build',
			launchpad_screen: 'off',
			checklist_statuses: {},
			checklist: [
				{
					id: 'setup_general',
					title: 'Give your site a name',
					completed: true,
					disabled: false,
				},
				{
					id: 'site_launched',
					title: 'Launch your site',
					completed: false,
					disabled: false,
					isLaunchTask: true,
				},
			],
			is_enabled: true,
			is_dismissed: false,
			is_dismissible: true,
			title: 'Site setup',
		} );
	} );

	afterEach( () => {
		window.localStorage.clear();
	} );

	it( 'keeps the server title of the launch task in the copy experiment control', async () => {
		assignPublishCopyVariation( 'control' );
		render();

		expect( await screen.findByText( 'Launch your site' ) ).toBeVisible();
	} );

	it( 'retitles the launch task in the copy experiment treatment', async () => {
		assignPublishCopyVariation( 'treatment' );
		render();

		expect( await screen.findByText( 'Publish your site' ) ).toBeVisible();
		expect( screen.queryByText( 'Launch your site' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Give your site a name' ) ).toBeVisible();
	} );
} );
