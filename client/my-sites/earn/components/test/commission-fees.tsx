/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import CommissionFees from '../commission-fees';

const renderCommissionFees = ( site = {} ) =>
	renderWithProvider( <CommissionFees commission={ 0.08 } siteSlug="example.wordpress.com" />, {
		initialState: {
			sites: {
				items: { 1: { ID: 1, URL: 'https://example.wordpress.com', options: {}, ...site } },
			},
			ui: { selectedSiteId: 1 },
		},
		reducers: { ui: uiReducer },
	} );

describe( 'CommissionFees', () => {
	// Without it, checkout drops the user on the generic thank-you page instead of
	// the payment settings whose fee they set out to lower.
	it( 'sends the user back to the page they upgraded from', () => {
		window.history.pushState( {}, '', '/earn/payments/example.wordpress.com' );
		renderCommissionFees();

		const url = new URL(
			screen.getByRole( 'link', { name: /Upgrade to lower/ } ).getAttribute( 'href' ) as string
		);
		expect( url.pathname ).toBe( '/plans/example.wordpress.com' );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe( '/earn/payments/example.wordpress.com' );
	} );

	it( 'offers no upgrade when there is no fee to lower', () => {
		renderWithProvider( <CommissionFees commission={ 0 } siteSlug="example.wordpress.com" />, {
			initialState: {
				sites: { items: { 1: { ID: 1, URL: 'https://example.wordpress.com', options: {} } } },
				ui: { selectedSiteId: 1 },
			},
			reducers: { ui: uiReducer },
		} );

		expect( screen.queryByRole( 'link', { name: /Upgrade to lower/ } ) ).not.toBeInTheDocument();
	} );
} );
