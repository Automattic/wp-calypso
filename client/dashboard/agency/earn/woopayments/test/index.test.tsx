/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import EarnWooPayments from '../index';

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

function mockAgency() {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: AGENCY_ID } ] )
		.persist();
}

function mockLicenses( items: unknown[] = [] ) {
	nock( API )
		.get( '/wpcom/v2/jetpack-licensing/licenses' )
		.query( true )
		.reply( 200, { items, total_pages: 1 } )
		.persist();
}

function mockSitesWithPlugins( sites: unknown[] = [] ) {
	nock( API )
		.get( `/wpcom/v2/agency/${ AGENCY_ID }/sites` )
		.query( true )
		.reply( 200, sites )
		.persist();
}

describe( 'EarnWooPayments', () => {
	test( 'shows the onboarding empty state when the agency has no WooPayments sites', async () => {
		mockAgency();
		mockLicenses( [] );
		mockSitesWithPlugins( [] );

		render( <EarnWooPayments /> );

		expect(
			await screen.findByText( 'Earn Revenue Share when clients use WooPayments' )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Add WooPayments to site' } ) ).toBeVisible();
	} );

	test( 'renders the commissions table and stat cards for a site with WooPayments', async () => {
		mockAgency();
		mockLicenses( [] );
		mockSitesWithPlugins( [
			{ id: 1, blog_id: 1, url: 'https://store.example.com', state: 'active' },
		] );
		nock( API )
			.get( '/rest/v1.1/jetpack-blogs/1/test-connection' )
			.query( true )
			.reply( 200, { connected: true } )
			.persist();
		nock( API )
			.get( `/wpcom/v2/agency/${ AGENCY_ID }/woocommerce/woopayments` )
			.query( true )
			.reply( 200, {
				status: 'success',
				data: {
					total: { payout: 0, tpv: 0, transactions: 0, sites: {} },
					estimated: {
						payout: 0,
						tpv: 0,
						transactions: 0,
						current_quarter: { payout: 0, tpv: 0, transactions: 0, sites: {} },
						previous_quarter: { payout: 0, tpv: 0, transactions: 0, sites: {} },
					},
					commission_eligible_sites: [ 1 ],
					commission_ineligible_sites: [],
				},
			} )
			.persist();
		nock( API )
			.get( `/wpcom/v2/agency/${ AGENCY_ID }/tipalti` )
			.query( true )
			.reply( 200, { Status: 'Active', IsPayable: true, PayableReason: [] } )
			.persist();

		render( <EarnWooPayments /> );

		expect( await screen.findByText( 'store.example.com' ) ).toBeVisible();
		expect( screen.getByText( 'Total WooPayments commissions paid' ) ).toBeVisible();
		expect(
			screen.queryByText( 'Earn Revenue Share when clients use WooPayments' )
		).not.toBeInTheDocument();
	} );
} );
