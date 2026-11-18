/**
 * @vitest-environment jsdom
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { render } from '../../../test-utils';
import PurchasesList from '../index';
import type { AppConfig } from '../../../app/context';
import type { Purchase, Site } from '@automattic/api-core';

// The removed purchase notice sits behind a feature flag.
vi.mock( '../cancel-purchase/use-is-split-cancel-remove-enabled', () => ( {
	useIsSplitCancelRemoveEnabled: () => true,
} ) );

const API = 'https://public-api.wordpress.com';
const SITE_ID = 1;

const OTHER_SITE_ID = 2;
const managedSite = { ID: SITE_ID, capabilities: { manage_options: true } } as Site;

const purchase = {
	ID: '5',
	blog_id: String( SITE_ID ),
	user_id: '1',
	product_name: 'Personal',
	product_slug: 'personal-bundle',
	product_type: 'bundle',
};

// Hosts that scope these screens to a site have no `me` section of their own.
const configWithMeSection: AppConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: {
		...APP_CONTEXT_DEFAULT_CONFIG.supports,
		me: { billing: { monetizeSubscriptions: false }, security: false, apps: false },
	},
};

const otherSitePurchase = {
	...purchase,
	ID: '6',
	blog_id: String( OTHER_SITE_ID ),
	product_name: 'Business',
	product_slug: 'business-bundle',
};

function mockOtherRequests( {
	preferences = {},
	sites = [],
	areSitesFailing = false,
}: { preferences?: Record< string, unknown >; sites?: Site[]; areSitesFailing?: boolean } = {} ) {
	nock( API ).get( '/rest/v1.2/upgrades' ).query( { type: 'transferred' } ).reply( 200, [] );
	nock( API )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( areSitesFailing ? 500 : 200, areSitesFailing ? { error: 'server_error' } : { sites } );
	nock( API ).get( '/rest/v1.2/me/payment-methods' ).query( true ).reply( 200, [] );
	nock( API )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: preferences } );
}

function mockRequests( {
	purchases = [ purchase ],
	...otherRequests
}: {
	purchases?: unknown[];
	preferences?: Record< string, unknown >;
	sites?: Site[];
	areSitesFailing?: boolean;
} = {} ) {
	nock( API )
		.get( '/rest/v1.2/upgrades' )
		.query( ( query ) => ! query.type && ! query.site )
		.reply( 200, purchases as Purchase[] );
	mockOtherRequests( otherRequests );
}

describe( '<PurchasesList>', () => {
	afterEach( () => {
		window.history.replaceState( null, '', '/' );
	} );

	test( 'lists the purchases with the toolbar', async () => {
		mockRequests();
		render( <PurchasesList />, { config: configWithMeSection } );

		const table = await screen.findByRole( 'table' );
		expect( within( table ).getByText( 'Personal' ) ).toBeVisible();
		expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
		expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();
	} );

	test( 'replaces the list when there are no purchases at all', async () => {
		mockRequests( { purchases: [] } );
		const { recordTracksEvent } = render( <PurchasesList />, { config: configWithMeSection } );

		expect( await screen.findByRole( 'heading', { name: 'No active upgrades' } ) ).toBeVisible();
		expect(
			screen.getByText( 'Plans, domains, and other purchases for your sites will appear here.' )
		).toBeVisible();
		expect( screen.queryByRole( 'searchbox' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();

		const offer = screen.getByRole( 'link', { name: 'Unlock offer' } );
		// jsdom does not navigate, the click only has to reach the handler.
		offer.addEventListener( 'click', ( event ) => event.preventDefault() );
		await userEvent.setup().click( offer );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_purchases_empty_state_action_click',
			{ action: 'offer' }
		);
	} );

	test( 'keeps the removed purchase notice above the empty state', async () => {
		mockRequests( { purchases: [] } );
		window.history.replaceState( null, '', '/?removed=plan&removedId=5' );
		render( <PurchasesList />, { config: configWithMeSection } );

		expect( await screen.findByRole( 'heading', { name: 'No active upgrades' } ) ).toBeVisible();
		expect( screen.getByText( /Your plan has been removed/ ) ).toBeVisible();
	} );

	test( 'does not show an empty state while the purchases load', async () => {
		let respond: () => void = () => {};
		const response = new Promise< void >( ( resolve ) => {
			respond = resolve;
		} );
		nock( API )
			.get( '/rest/v1.2/upgrades' )
			.query( ( query ) => ! query.type && ! query.site )
			.reply( async () => {
				await response;
				return [ 200, [] ];
			} );
		mockOtherRequests();
		render( <PurchasesList />, { config: configWithMeSection } );

		// The toolbar is there, so the page is past its own loading placeholder.
		expect( await screen.findByRole( 'searchbox' ) ).toBeVisible();
		expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();

		respond();
		expect( await screen.findByRole( 'heading', { name: 'No active upgrades' } ) ).toBeVisible();
	} );

	test( 'does not show an empty state when the purchases fail to load', async () => {
		nock( API )
			.get( '/rest/v1.2/upgrades' )
			.query( ( query ) => ! query.type && ! query.site )
			.reply( 500, { error: 'server_error' } );
		mockOtherRequests();
		render( <PurchasesList />, { config: configWithMeSection } );

		expect( await screen.findByText( 'No results' ) ).toBeVisible();
		expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
		expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the toolbar when a search finds nothing', async () => {
		mockRequests();
		const user = userEvent.setup();
		render( <PurchasesList />, { config: configWithMeSection } );

		await screen.findByRole( 'table' );
		await user.type( screen.getByRole( 'searchbox' ), 'no such upgrade' );

		expect(
			await screen.findByRole( 'heading', { name: 'No upgrades match your search' } )
		).toBeVisible();
		expect( screen.getByText( 'Try a different search term.' ) ).toBeVisible();
		expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
	} );

	test( 'keeps the toolbar when the filters find nothing', async () => {
		mockRequests( {
			preferences: {
				'hosting-dashboard-dataviews-view-me-billing-purchases': {
					type: 'table',
					filters: [ { field: 'site', operator: 'isAny', value: [ '999' ] } ],
				},
			},
		} );
		render( <PurchasesList />, { config: configWithMeSection } );

		expect(
			await screen.findByRole( 'heading', { name: 'No upgrades match your filters' } )
		).toBeVisible();
		expect( screen.getByText( 'Try different filters, or reset them.' ) ).toBeVisible();
		expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
	} );

	test( 'says the site has no upgrades when the host locks the list to a site', async () => {
		mockRequests();
		window.history.replaceState( null, '', '/?site=999' );
		// No `me` section: the host sets the site filter and the visitor cannot reset it.
		render( <PurchasesList /> );

		expect(
			await screen.findByRole( 'heading', { name: 'No active upgrades for this site' } )
		).toBeVisible();
		expect(
			screen.getByText( 'Plans, domains, and other purchases for this site will appear here.' )
		).toBeVisible();
		expect( screen.queryByText( 'Try different filters, or reset them.' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'searchbox' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: 'Unlock offer' } ) ).not.toBeInTheDocument();
	} );

	test( 'lists only the purchases of the site the host locks the list to', async () => {
		mockRequests( { purchases: [ purchase, otherSitePurchase ] } );
		window.history.replaceState( null, '', `/?site=${ SITE_ID }` );
		render( <PurchasesList /> );

		const table = await screen.findByRole( 'table' );
		expect( within( table ).getByText( 'Personal' ) ).toBeVisible();
		expect( within( table ).queryByText( 'Business' ) ).not.toBeInTheDocument();
	} );

	test( 'uses the site wording, without the offer, on a host with no account section', async () => {
		mockRequests( { purchases: [] } );
		// No `me` section and no site filter in the URL yet.
		render( <PurchasesList /> );

		expect(
			await screen.findByRole( 'heading', { name: 'No active upgrades for this site' } )
		).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'No active upgrades' } )
		).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: 'Unlock offer' } ) ).not.toBeInTheDocument();
	} );

	test( 'does not show an empty state when the purchases of other users fail to load', async () => {
		// The viewer manages the site but owns nothing on it: only the failed
		// request could tell whether another administrator bought its plan.
		mockRequests( { purchases: [ otherSitePurchase ], sites: [ managedSite ] } );
		const sitePurchases = nock( API )
			.get( '/rest/v1.2/upgrades' )
			.query( { site: SITE_ID } )
			.reply( 500, { error: 'server_error' } );
		window.history.replaceState( null, '', `/?site=${ SITE_ID }` );
		render( <PurchasesList /> );

		expect( await screen.findByText( 'No results' ) ).toBeVisible();
		expect( sitePurchases.isDone() ).toBe( true );
		expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();
	} );

	test( 'shows the empty state once the purchases of other users load empty', async () => {
		mockRequests( { purchases: [ otherSitePurchase ], sites: [ managedSite ] } );
		nock( API ).get( '/rest/v1.2/upgrades' ).query( { site: SITE_ID } ).reply( 200, [] );
		window.history.replaceState( null, '', `/?site=${ SITE_ID }` );
		render( <PurchasesList /> );

		expect(
			await screen.findByRole( 'heading', { name: 'No active upgrades for this site' } )
		).toBeVisible();
	} );

	test( 'does not show an empty state when the sites fail to load', async () => {
		mockRequests( { purchases: [], areSitesFailing: true } );
		render( <PurchasesList />, { config: configWithMeSection } );

		expect( await screen.findByText( 'No results' ) ).toBeVisible();
		expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();
	} );
} );
