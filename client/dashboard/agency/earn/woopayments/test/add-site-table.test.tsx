/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import AddWooPaymentsToSiteModal from '../add-to-site/modal';

// The DataViews list layout scrolls the selected row into view; JSDOM doesn't
// implement scrollIntoView (see client/dashboard/sites/backups/test/index.test.tsx).
Element.prototype.scrollIntoView = jest.fn();

const AGENCY_ID = 7;

function mockApiEndpoints( {
	total,
	sites,
}: {
	total: number;
	sites: { blog_id: number; url: string }[];
} ) {
	// agencyQuery() / activeAgencyQuery() → GET /wpcom/v2/agency
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: AGENCY_ID } ] );

	// agencyWooPaymentsLicensedSitesQuery() → GET /wpcom/v2/jetpack-licensing/licenses
	nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/jetpack-licensing/licenses' )
		.query( true )
		.reply( 200, { items: [], total_pages: 1 } );

	// agencyWooPaymentsPluginSitesQuery() → GET /wpcom/v2/agency/:id/sites
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/agency/${ AGENCY_ID }/sites` )
		.query( true )
		.reply( 200, { sites: [] } );

	// paginatedAgencySitesQuery() count probe → GET /wpcom/v2/jetpack-agency/sites?per_page=1
	nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/jetpack-agency/sites' )
		.query( ( actualQuery ) => actualQuery.per_page === '1' )
		.reply( 200, { sites: sites.slice( 0, 1 ), total } );

	// agencySitesQuery() full fetch → GET /wpcom/v2/jetpack-agency/sites?per_page=<total>
	nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/jetpack-agency/sites' )
		.query( ( actualQuery ) => actualQuery.per_page === String( total ) )
		.reply( 200, { sites, total } );
}

describe( '<AddWooPaymentsToSiteModal>', () => {
	test( 'renders every agency site and enables the confirm button once one is selected', async () => {
		const user = userEvent.setup();
		const sites = [
			{ blog_id: 1, url: 'siteone.example.com' },
			{ blog_id: 2, url: 'sitetwo.example.com' },
			{ blog_id: 3, url: 'sitethree.example.com' },
		];
		mockApiEndpoints( { total: sites.length, sites } );
		const recordTracksEvent = jest.fn();

		render(
			<AddWooPaymentsToSiteModal onClose={ jest.fn() } recordTracksEvent={ recordTracksEvent } />
		);

		await screen.findByText( 'siteone.example.com' );
		expect( screen.getByText( 'sitetwo.example.com' ) ).toBeVisible();
		expect( screen.getByText( 'sitethree.example.com' ) ).toBeVisible();

		const confirmButton = screen.getByRole( 'button', {
			name: 'Add WooPayments to selected site',
		} );
		expect( confirmButton ).toBeDisabled();

		await user.click( screen.getByRole( 'button', { name: 'sitetwo.example.com' } ) );

		await waitFor( () => expect( confirmButton ).toBeEnabled() );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a8c_woopayments_add_site_table_select_site_click'
		);
	} );

	test( 'fetches sites beyond the old 100-site cap by requesting the full agency total', async () => {
		const sites = Array.from( { length: 120 }, ( _, index ) => ( {
			blog_id: index + 1,
			url: `site${ index + 1 }.example.com`,
		} ) );
		mockApiEndpoints( { total: sites.length, sites } );

		render( <AddWooPaymentsToSiteModal onClose={ jest.fn() } /> );

		await screen.findByText( 'site1.example.com' );

		const user = userEvent.setup();
		const searchInput = screen.getByRole( 'searchbox' );
		await user.type( searchInput, 'site120.example.com' );

		await waitFor( () => expect( screen.getByText( 'site120.example.com' ) ).toBeVisible() );

		const confirmButton = screen.getByRole( 'button', {
			name: 'Add WooPayments to selected site',
		} );
		await user.click( screen.getByRole( 'button', { name: 'site120.example.com' } ) );

		await waitFor( () => expect( confirmButton ).toBeEnabled() );
	} );
} );
