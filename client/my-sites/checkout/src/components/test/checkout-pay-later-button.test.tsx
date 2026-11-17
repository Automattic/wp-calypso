/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import routeReducer from 'calypso/state/route/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { leaveCheckout } from '../../lib/leave-checkout';
import CheckoutPayLaterButton from '../checkout-pay-later-button';

jest.mock( '../../lib/leave-checkout', () => ( {
	leaveCheckout: jest.fn(),
} ) );

jest.mock( '../../hooks/use-checkout-site', () => ( {
	...jest.requireActual( '../../hooks/use-checkout-site' ),
	useCheckoutSite: () => ( { data: undefined } ),
} ) );

const SITE_SLUG = 'preview.wpcomstaging.com';
const OVERVIEW_URL = `https://my.wordpress.com/sites/${ SITE_SLUG }?skippedCheckout=1`;

const render = ( query: Record< string, string > ) =>
	renderWithProvider( <CheckoutPayLaterButton />, {
		reducers: { route: routeReducer, ui: uiReducer },
		initialState: {
			route: { query: { initial: query, current: query, previous: false } },
			ui: { selectedSiteId: 1 },
			sites: { items: { 1: { ID: 1, URL: `https://${ SITE_SLUG }`, slug: SITE_SLUG } } },
		},
	} );

describe( 'CheckoutPayLaterButton', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'leaves for the Dashboard back URL and keeps the cart', async () => {
		render( { pay_later: '1', checkoutBackUrl: OVERVIEW_URL } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Pay later' } ) );

		expect( leaveCheckout ).toHaveBeenCalledTimes( 1 );
		expect( leaveCheckout ).toHaveBeenCalledWith( {
			siteSlug: SITE_SLUG,
			forceCheckoutBackUrl: OVERVIEW_URL,
			tracksEvent: 'calypso_checkout_pay_later_clicked',
		} );
	} );

	it( 'is hidden unless the checkout asks for it', () => {
		render( { checkoutBackUrl: OVERVIEW_URL } );

		expect( screen.queryByRole( 'button', { name: 'Pay later' } ) ).not.toBeInTheDocument();
	} );

	it( 'is hidden without a back URL', () => {
		render( { pay_later: '1' } );

		expect( screen.queryByRole( 'button', { name: 'Pay later' } ) ).not.toBeInTheDocument();
	} );

	it( 'is hidden when the back URL leaves for another host', () => {
		render( { pay_later: '1', checkoutBackUrl: 'https://evil.example/' } );

		expect( screen.queryByRole( 'button', { name: 'Pay later' } ) ).not.toBeInTheDocument();
	} );
} );
