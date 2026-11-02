/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { createStore } from 'redux';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import WooPaymentsDashboard from '..';

jest.mock( 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour', () => ( {
	LayoutWithGuidedTour: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
} ) );
jest.mock(
	'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification',
	() =>
		( { children }: { children: React.ReactNode } ) => <div>{ children }</div>
);
jest.mock(
	'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation',
	() => () => null
);

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;
const PICKER = { name: 'Which site would you like to add WooPayments to?' };

function mockEmptyAgency() {
	nock( API )
		.get( `/wpcom/v2/agency/${ AGENCY_ID }/sites` )
		.query( true )
		.reply( 200, [] )
		.persist();
	nock( API )
		.get( '/wpcom/v2/jetpack-licensing/licenses' )
		.query( true )
		.reply( 200, { items: [], total_pages: 1 } )
		.persist();
}

function renderDashboard() {
	const state = { a8cForAgencies: { agencies: { activeAgency: { id: AGENCY_ID } } } };
	const store = createStore( () => state );
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return renderWithProvider( <WooPaymentsDashboard />, { store, queryClient } );
}

describe( 'WooPaymentsDashboard', () => {
	afterEach( () => {
		nock.cleanAll();
		window.history.replaceState( null, '', '/' );
	} );

	test( 'opens one site picker when the overview links here, and removes the param', async () => {
		mockEmptyAgency();
		window.history.replaceState( null, '', '/woopayments/dashboard?add-woopayments-to-site=true' );

		renderDashboard();

		expect( await screen.findByRole( 'dialog', PICKER ) ).toBeVisible();
		expect( screen.getAllByRole( 'dialog' ) ).toHaveLength( 1 );
		expect( window.location.search ).toBe( '' );
	} );

	test( 'opens the site picker for a link to the page it already shows', async () => {
		mockEmptyAgency();
		window.history.replaceState( null, '', '/woopayments/dashboard' );

		const { rerender } = renderDashboard();
		expect(
			await screen.findByText( 'Earn Revenue Share when clients use WooPayments' )
		).toBeVisible();
		expect( screen.queryByRole( 'dialog', PICKER ) ).not.toBeInTheDocument();

		// page.js renders the same page again for the new URL.
		window.history.pushState( null, '', '/woopayments/dashboard?add-woopayments-to-site=true' );
		rerender( <WooPaymentsDashboard /> );

		expect( await screen.findByRole( 'dialog', PICKER ) ).toBeVisible();
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
	} );
} );
