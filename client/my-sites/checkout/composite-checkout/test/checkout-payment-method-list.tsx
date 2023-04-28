/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import { dispatch } from '@wordpress/data';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import {
	mockSetCartEndpointWith,
	getActivePersonalPlanDataForType,
	countryList,
	getBasicCart,
	mockMatchMediaOnWindow,
	mockGetPaymentMethodsEndpoint,
	mockLogStashEndpoint,
	mockGetVatInfoEndpoint,
	mockGetSupportedCountriesEndpoint,
} from './util';
import { MockCheckout } from './util/mock-checkout';

/* eslint-disable jest/no-conditional-expect */

jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/sites/domains/selectors' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'calypso/state/sites/plans/selectors/get-plans-by-site' );
jest.mock( 'calypso/my-sites/checkout/use-cart-key' );
jest.mock( 'calypso/lib/analytics/utils/refresh-country-code-cookie-gdpr' );
jest.mock( 'calypso/state/products-list/selectors/is-marketplace-product' );
jest.mock( 'calypso/lib/navigate' );

describe( 'Checkout payment methods list', () => {
	const initialCart = getBasicCart();
	const mainCartKey = 123456;

	const mockSetCartEndpoint = mockSetCartEndpointWith( {
		currency: initialCart.currency,
		locale: initialCart.locale,
	} );

	beforeEach( () => {
		dispatch( CHECKOUT_STORE ).reset();
		jest.clearAllMocks();
		getPlansBySiteId.mockImplementation( () => ( {
			data: getActivePersonalPlanDataForType( 'yearly' ),
		} ) );
		hasLoadedSiteDomains.mockImplementation( () => true );
		getDomainsBySiteId.mockImplementation( () => [] );
		isMarketplaceProduct.mockImplementation( () => false );
		isJetpackSite.mockImplementation( () => false );

		mockGetPaymentMethodsEndpoint( [] );
		mockLogStashEndpoint();
		mockGetVatInfoEndpoint( {} );
		mockGetSupportedCountriesEndpoint( countryList );
		mockMatchMediaOnWindow();
	} );

	it( 'renders the paypal payment method option', async () => {
		render(
			<MockCheckout
				mainCartKey={ mainCartKey }
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
			/>
		);
		await waitFor( () => {
			expect( screen.getByText( 'PayPal' ) ).toBeInTheDocument();
		} );
	} );

	it( 'does not render the full credits payment method option when no credits are available', async () => {
		render(
			<MockCheckout
				mainCartKey={ mainCartKey }
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
			/>
		);
		await waitFor( () => {
			expect( screen.queryByText( /WordPress.com Credits:/ ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not render the full credits payment method option when partial credits are available', async () => {
		const cartChanges = { credits_integer: 15400, credits_display: 'R$154' };
		render(
			<MockCheckout
				mainCartKey={ mainCartKey }
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
			/>
		);
		await waitFor( () => {
			expect( screen.queryByText( /WordPress.com Credits:/ ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders the paypal payment method option when partial credits are available', async () => {
		const cartChanges = { credits_integer: 15400, credits_display: 'R$154' };
		render(
			<MockCheckout
				mainCartKey={ mainCartKey }
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
			/>
		);
		await waitFor( () => {
			expect( screen.getByText( 'PayPal' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders the full credits payment method option when full credits are available', async () => {
		const cartChanges = {
			sub_total_integer: 0,
			sub_total_display: '0',
			credits_integer: 15600,
			credits_display: 'R$156',
		};
		render(
			<MockCheckout
				mainCartKey={ mainCartKey }
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
			/>
		);
		await waitFor( () => {
			expect( screen.getByText( /WordPress.com Credits:/ ) ).toBeInTheDocument();
		} );
	} );

	it( 'does not render the other payment method options when full credits are available', async () => {
		const cartChanges = {
			sub_total_integer: 0,
			sub_total_display: '0',
			credits_integer: 15600,
			credits_display: 'R$156',
		};
		render(
			<MockCheckout
				mainCartKey={ mainCartKey }
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
			/>
		);
		await waitFor( () => {
			expect( screen.queryByText( 'PayPal' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not render the free payment method option when the purchase is not free', async () => {
		render(
			<MockCheckout
				mainCartKey={ mainCartKey }
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
			/>
		);
		await waitFor( () => {
			expect( screen.queryByText( 'Free Purchase' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not render the paypal payment method option when the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render(
			<MockCheckout
				mainCartKey={ mainCartKey }
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
			/>
		);
		await waitFor( () => {
			expect( screen.queryByText( 'PayPal' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not render the full credits payment method option when full credits are available but the purchase is free', async () => {
		const cartChanges = {
			sub_total_integer: 0,
			sub_total_display: '0',
			total_tax_integer: 0,
			total_tax_display: 'R$0',
			total_cost_integer: 0,
			total_cost_display: '0',
			credits_integer: 15600,
			credits_display: 'R$156',
		};
		render(
			<MockCheckout
				mainCartKey={ mainCartKey }
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
			/>
		);
		await waitFor( () => {
			expect( screen.queryByText( /WordPress.com Credits:/ ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders the free payment method option when the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render(
			<MockCheckout
				mainCartKey={ mainCartKey }
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
			/>
		);
		await waitFor( () => {
			expect( screen.getByText( 'Free Purchase' ) ).toBeInTheDocument();
		} );
	} );

	it( 'does not render the contact step when the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render(
			<MockCheckout
				mainCartKey={ mainCartKey }
				initialCart={ initialCart }
				setCart={ mockSetCartEndpoint }
				cartChanges={ cartChanges }
			/>
		);
		await waitFor( () => {
			expect(
				screen.queryByText( /Enter your (billing|contact) information/ )
			).not.toBeInTheDocument();
		} );
	} );
} );
