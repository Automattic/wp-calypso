/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch } from '@wordpress/data';
import nock from 'nock';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import {
	domainProduct,
	domainTransferProduct,
	planWithBundledDomain,
	planWithoutDomain,
	getActivePersonalPlanDataForType,
	getBasicCart,
	mockMatchMediaOnWindow,
	mockGetVatInfoEndpoint,
	countryList,
	mockGetPaymentMethodsEndpoint,
	mockLogStashEndpoint,
	mockGetSupportedCountriesEndpoint,
} from './util';
import { MockCheckout } from './util/mock-checkout';
import type { CartKey } from '@automattic/shopping-cart';

jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/sites/domains/selectors' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'calypso/state/sites/plans/selectors/get-plans-by-site' );
jest.mock( 'calypso/my-sites/checkout/use-cart-key' );
jest.mock( 'calypso/lib/analytics/utils/refresh-country-code-cookie-gdpr' );
jest.mock( 'calypso/state/products-list/selectors/is-marketplace-product' );
jest.mock( 'calypso/lib/navigate' );

describe( 'Checkout contact step', () => {
	const mainCartKey = 'foo.com' as CartKey;
	const initialCart = getBasicCart();
	const defaultPropsForMockCheckout = {
		initialCart,
	};

	getPlansBySiteId.mockImplementation( () => ( {
		data: getActivePersonalPlanDataForType( 'yearly' ),
	} ) );
	hasLoadedSiteDomains.mockImplementation( () => true );
	getDomainsBySiteId.mockImplementation( () => [] );
	isMarketplaceProduct.mockImplementation( () => false );
	isJetpackSite.mockImplementation( () => false );
	( useCartKey as jest.Mock ).mockImplementation( () => mainCartKey );
	mockMatchMediaOnWindow();

	beforeEach( () => {
		dispatch( CHECKOUT_STORE ).reset();
		nock.cleanAll();
		mockGetVatInfoEndpoint( {} );
		mockGetPaymentMethodsEndpoint( [] );
		mockLogStashEndpoint();
		mockGetSupportedCountriesEndpoint( countryList );
	} );

	it( 'does not render the contact step when the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await expect( screen.findByText( /Enter your (billing|contact) information/ ) ).toNeverAppear();
	} );

	it( 'renders the step after the contact step as active if the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		expect( await screen.findByText( 'Assign a payment method later' ) ).toBeVisible();
	} );

	it( 'renders the contact step when the purchase is not free', async () => {
		render( <MockCheckout { ...defaultPropsForMockCheckout } /> );
		expect(
			await screen.findByText( /Enter your (billing|contact) information/ )
		).toBeInTheDocument();
	} );

	it( 'renders the tax fields only when no domain is in the cart', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Phone' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Email' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the domain fields when a domain is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
	} );

	it( 'renders the domain fields when a domain transfer is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainTransferProduct ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
	} );

	it( 'does not render country-specific domain fields when no country has been chosen and a domain is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Address' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'City' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'State' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'ZIP code' ) ).not.toBeInTheDocument();
	} );

	it( 'renders country-specific domain fields when a country has been chosen and a domain is in the cart', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'US' );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Address' ) ).toBeInTheDocument();
		expect( screen.getByText( 'City' ) ).toBeInTheDocument();
		expect( screen.getByText( 'State' ) ).toBeInTheDocument();
		expect( screen.getByText( 'ZIP code' ) ).toBeInTheDocument();
	} );

	it( 'renders domain fields with postal code when a country with postal code support has been chosen and a plan is in the cart', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'US' );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Postal code' ) ).toBeInTheDocument();
	} );

	it( 'renders domain fields except postal code when a country without postal code support has been chosen and a plan is in the cart', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'CW' );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Postal code' ) ).not.toBeInTheDocument();
	} );

	it( 'renders domain fields with postal code when a country with postal code support has been chosen and a domain is in the cart', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'US' );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
		expect( screen.getByText( 'ZIP code' ) ).toBeInTheDocument();
	} );

	it( 'renders domain fields except postal code when a country without postal code support has been chosen and a domain is in the cart', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } /> );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'CW' );
		expect( await screen.findByText( 'Country' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Postal Code' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Postal code' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'ZIP code' ) ).not.toBeInTheDocument();
	} );
} );
