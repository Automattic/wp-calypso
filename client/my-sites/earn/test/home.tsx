/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import membershipsReducer from 'calypso/state/memberships/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import Home from '../home';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

// Requests stay pending: the cards under test read their state from Redux, not
// from anything these would return.
jest.mock( 'calypso/lib/wp', () => {
	const pending = () => new Promise( () => {} );
	return { __esModule: true, default: { req: { get: pending, post: pending } } };
} );

const mockedPage = page as unknown as jest.Mock;

// A monthly plan has none of the monetization features, so every card that can
// upsell does.
const renderHome = () =>
	renderWithProvider( <Home />, {
		initialState: {
			currentUser: { capabilities: { 1: { manage_options: true } } },
			sites: {
				items: { 1: { ID: 1, URL: 'https://example.wordpress.com', options: {} } },
				features: { 1: { data: { active: [] } } },
				plans: {
					1: { data: [ { currentPlan: true, productSlug: 'personal-bundle-monthly' } ] },
				},
			},
			ui: { selectedSiteId: 1 },
			memberships: { productList: { items: {} }, settings: {} },
		},
		reducers: { ui: uiReducer, memberships: membershipsReducer },
	} );

const lastDestination = () => new URL( mockedPage.mock.lastCall[ 0 ], window.location.origin );

describe( 'Earn home', () => {
	beforeEach( () => {
		mockedPage.mockClear();
		window.history.pushState( {}, '', '/earn/example.wordpress.com' );
	} );

	// Without it, checkout drops the user on the generic thank-you page instead of
	// the monetization tool they set out to use.
	it( 'sends the user back to the Monetize page after every upgrade', async () => {
		renderHome();

		const upgrades = screen.getAllByRole( 'button', { name: 'Upgrade' } );
		expect( upgrades ).toHaveLength( 3 );

		for ( const upgrade of upgrades ) {
			await userEvent.click( upgrade );
			expect( lastDestination().searchParams.get( 'redirect_to' ) ).toBe(
				'/earn/example.wordpress.com'
			);
		}
	} );

	// The plans page forwards `redirect_to` to checkout; a direct checkout link is
	// expected to carry a cancel destination of its own too.
	it( 'gives the checkout link a cancel destination', async () => {
		renderHome();

		// Refer a friend is the only card that skips the plans page, sending a
		// monthly plan straight to checkout for its annual equivalent.
		await userEvent.click( screen.getAllByRole( 'button', { name: 'Upgrade' } )[ 2 ] );

		const destination = lastDestination();
		expect( destination.pathname ).toBe( '/checkout/example.wordpress.com/personal-bundle' );
		expect( destination.searchParams.get( 'cancel_to' ) ).toBe( '/earn/example.wordpress.com' );
	} );
} );
