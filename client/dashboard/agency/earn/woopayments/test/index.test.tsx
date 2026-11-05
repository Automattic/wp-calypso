/**
 * @jest-environment jsdom
 */
import { activeAgencyQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import EarnWooPayments from '../index';

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

function mockAgency() {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: AGENCY_ID, approval_status: 'approved' } ] )
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

function mockWooPaymentsSite() {
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
}

const PICKER = { name: 'Which site would you like to add WooPayments to?' };

describe( 'EarnWooPayments', () => {
	afterEach( () => {
		window.history.replaceState( null, '', '/' );
	} );

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

	test( 'opens the site picker once when a link asks for it, and removes the param', async () => {
		mockAgency();
		mockLicenses( [] );
		mockSitesWithPlugins( [] );
		window.history.replaceState( null, '', '/woopayments?add-woopayments-to-site=true&keep=1' );

		const { recordTracksEvent } = render( <EarnWooPayments /> );

		expect( await screen.findByRole( 'dialog', PICKER ) ).toBeVisible();
		await waitFor( () => expect( window.location.search ).toBe( '?keep=1' ) );
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_woopayments_add_site_button_click'
		);
	} );

	test( 'opens the site picker again for a later link to the open page', async () => {
		const user = userEvent.setup();
		mockAgency();
		mockLicenses( [] );
		mockSitesWithPlugins( [] );
		window.history.replaceState( null, '', '/woopayments?add-woopayments-to-site=true' );

		const { recordTracksEvent, router } = render( <EarnWooPayments /> );
		await screen.findByRole( 'dialog', PICKER );
		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );
		await waitFor( () => expect( window.location.search ).toBe( '' ) );

		await act( async () => router.history.push( '/woopayments?add-woopayments-to-site=true' ) );

		expect( await screen.findByRole( 'dialog', PICKER ) ).toBeVisible();
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'does not reopen a closed site picker when the page swaps its buttons', async () => {
		const user = userEvent.setup();
		mockAgency();
		mockLicenses( [] );
		mockSitesWithPlugins( [] );
		window.history.replaceState( null, '', '/woopayments?add-woopayments-to-site=true' );

		const { queryClient, recordTracksEvent } = render( <EarnWooPayments /> );
		await screen.findByRole( 'dialog', PICKER );
		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		await waitFor( () => expect( queryClient.isFetching() ).toBe( 0 ) );

		// The agency now has a WooPayments site, so the header's button replaces the empty state's.
		nock.cleanAll();
		mockAgency();
		mockLicenses( [] );
		mockWooPaymentsSite();
		await act( () => queryClient.invalidateQueries() );

		expect( await screen.findByText( 'store.example.com' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Add WooPayments to site' } ) ).toBeVisible();
		expect( screen.queryByRole( 'dialog', PICKER ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'opens the site picker from the header button for an agency with WooPayments sites', async () => {
		const user = userEvent.setup();
		mockAgency();
		mockLicenses( [] );
		mockWooPaymentsSite();
		// The route loads the agency before the page renders, so the empty state never shows.
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		queryClient.setQueryData( activeAgencyQuery().queryKey, {
			id: AGENCY_ID,
			approval_status: 'approved',
		} as never );
		window.history.replaceState( null, '', '/woopayments?add-woopayments-to-site=true' );

		const { recordTracksEvent, router } = render( <EarnWooPayments />, { queryClient } );

		expect( await screen.findByRole( 'dialog', PICKER ) ).toBeVisible();
		expect( screen.getByText( 'store.example.com' ) ).toBeInTheDocument();
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );
		await waitFor( () => expect( screen.queryByRole( 'dialog', PICKER ) ).not.toBeInTheDocument() );

		await act( async () => router.history.push( '/woopayments?add-woopayments-to-site=true' ) );

		expect( await screen.findByRole( 'dialog', PICKER ) ).toBeVisible();
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'renders the commissions table and stat cards for a site with WooPayments', async () => {
		mockAgency();
		mockLicenses( [] );
		mockWooPaymentsSite();

		render( <EarnWooPayments /> );

		expect( await screen.findByText( 'store.example.com' ) ).toBeVisible();
		expect( screen.getByText( 'Total WooPayments commissions paid' ) ).toBeVisible();
		expect(
			screen.queryByText( 'Earn Revenue Share when clients use WooPayments' )
		).not.toBeInTheDocument();
	} );
} );
