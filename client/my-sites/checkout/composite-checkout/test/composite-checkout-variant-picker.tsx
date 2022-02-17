/**
 * @jest-environment jsdom
 */
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { ShoppingCartProvider, createShoppingCartManagerClient } from '@automattic/shopping-cart';
import { render, fireEvent, screen, within, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider as ReduxProvider } from 'react-redux';
import '@testing-library/jest-dom/extend-expect';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import getIntroOfferIsEligible from 'calypso/state/selectors/get-intro-offer-is-eligible';
import getIntroOfferPrice from 'calypso/state/selectors/get-intro-offer-price';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import CompositeCheckout from '../composite-checkout';
import {
	siteId,
	domainProduct,
	planWithoutDomain,
	fetchStripeConfiguration,
	mockSetCartEndpointWith,
	mockGetCartEndpointWith,
	getActivePersonalPlanDataForType,
	getPersonalPlanForInterval,
	getBusinessPlanForInterval,
	getVariantItemTextForInterval,
	getPlansItemsState,
	createTestReduxStore,
	countryList,
} from './util';

jest.mock( 'calypso/lib/analytics/utils/refresh-country-code-cookie-gdpr' );
jest.mock( 'calypso/my-sites/checkout/use-cart-key' );
jest.mock( 'calypso/state/products-list/selectors/is-marketplace-product' );
jest.mock( 'calypso/state/selectors/get-intro-offer-price' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'calypso/state/sites/domains/selectors' );
jest.mock( 'calypso/state/sites/plans/selectors/get-plans-by-site' );
jest.mock( 'calypso/state/sites/selectors' );

/* eslint-disable jest/no-conditional-expect */

describe( 'CompositeCheckout with a variant picker', () => {
	let MyCheckout;

	beforeEach( () => {
		jest.clearAllMocks();
		getPlansBySiteId.mockImplementation( () => ( {
			data: getActivePersonalPlanDataForType( 'yearly' ),
		} ) );
		hasLoadedSiteDomains.mockImplementation( () => true );
		getDomainsBySiteId.mockImplementation( () => [] );
		isMarketplaceProduct.mockImplementation( () => false );
		getIntroOfferPrice.mockImplementation( () => null );
		getIntroOfferIsEligible.mockImplementation( () => false );

		const initialCart = {
			coupon: '',
			coupon_savings_total: 0,
			coupon_savings_total_integer: 0,
			coupon_savings_total_display: '0',
			currency: 'BRL',
			locale: 'br-pt',
			is_coupon_applied: false,
			products: [ planWithoutDomain ],
			tax: {
				display_taxes: true,
				location: {},
			},
			temporary: false,
			allowed_payment_methods: [ 'WPCOM_Billing_PayPal_Express' ],
			savings_total_integer: 0,
			savings_total_display: 'R$0',
			total_tax_integer: 700,
			total_tax_display: 'R$7',
			total_cost_integer: 15600,
			total_cost_display: 'R$156',
			sub_total_integer: 15600,
			sub_total_display: 'R$156',
			coupon_discounts_integer: [],
		};

		const mockSetCartEndpoint = mockSetCartEndpointWith( {
			currency: initialCart.currency,
			locale: initialCart.locale,
		} );

		const store = createTestReduxStore();
		nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/logstash' ).reply( 200 );
		Object.defineProperty( window, 'matchMedia', {
			writable: true,
			value: jest.fn().mockImplementation( ( query ) => ( {
				matches: false,
				media: query,
				onchange: null,
				addListener: jest.fn(), // deprecated
				removeListener: jest.fn(), // deprecated
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
				dispatchEvent: jest.fn(),
			} ) ),
		} );

		MyCheckout = ( { cartChanges, additionalProps, additionalCartProps, useUndefinedCartKey } ) => {
			const managerClient = createShoppingCartManagerClient( {
				getCart: mockGetCartEndpointWith( { ...initialCart, ...( cartChanges ?? {} ) } ),
				setCart: mockSetCartEndpoint,
			} );
			const mainCartKey = 'foo.com';
			( useCartKey as jest.Mock ).mockImplementation( () =>
				useUndefinedCartKey ? undefined : mainCartKey
			);
			return (
				<ReduxProvider store={ store }>
					<ShoppingCartProvider
						managerClient={ managerClient }
						options={ {
							defaultCartKey: useUndefinedCartKey ? undefined : mainCartKey,
						} }
						{ ...additionalCartProps }
					>
						<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfiguration }>
							<CompositeCheckout
								siteId={ siteId }
								siteSlug={ 'foo.com' }
								getStoredCards={ async () => [] }
								overrideCountryList={ countryList }
								{ ...additionalProps }
							/>
						</StripeHookProvider>
					</ShoppingCartProvider>
				</ReduxProvider>
			);
		};
	} );

	it.each( [
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'monthly' },
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'yearly' },
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'two-year' },
		{ activePlan: 'yearly', cartPlan: 'yearly', expectedVariant: 'yearly' },
		{ activePlan: 'yearly', cartPlan: 'yearly', expectedVariant: 'two-year' },
		{ activePlan: 'monthly', cartPlan: 'yearly', expectedVariant: 'monthly' },
		{ activePlan: 'monthly', cartPlan: 'yearly', expectedVariant: 'yearly' },
		{ activePlan: 'monthly', cartPlan: 'yearly', expectedVariant: 'two-year' },
		{ activePlan: 'monthly', cartPlan: 'two-year', expectedVariant: 'monthly' },
		{ activePlan: 'monthly', cartPlan: 'two-year', expectedVariant: 'yearly' },
		{ activePlan: 'monthly', cartPlan: 'two-year', expectedVariant: 'two-year' },
	] )(
		'renders the variant picker with $expectedVariant for a $cartPlan plan when the current plan is $activePlan',
		async ( { activePlan, cartPlan, expectedVariant } ) => {
			getPlansBySiteId.mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( activePlan ),
			} ) );
			const cartChanges = { products: [ getBusinessPlanForInterval( cartPlan ) ] };
			render( <MyCheckout cartChanges={ cartChanges } /> );

			const editOrderButton = await screen.findByLabelText( 'Edit your order' );
			fireEvent.click( editOrderButton );

			expect( screen.getByText( getVariantItemTextForInterval( expectedVariant ) ) ).toBeVisible();
		}
	);

	it.each( [
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'yearly' },
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'two-year' },
	] )(
		'does not render the $expectedVariant variant for a $cartPlan plan when the current plan is $activePlan and the order is not being edited',
		async ( { activePlan, cartPlan, expectedVariant } ) => {
			getPlansBySiteId.mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( activePlan ),
			} ) );
			const cartChanges = { products: [ getBusinessPlanForInterval( cartPlan ) ] };
			render( <MyCheckout cartChanges={ cartChanges } /> );

			const renderedVariant = await screen.findByText(
				getVariantItemTextForInterval( expectedVariant )
			);
			expect( renderedVariant ).not.toBeVisible();
		}
	);

	it.each( [
		{ activePlan: 'yearly', cartPlan: 'yearly', expectedVariant: 'monthly' },
		{ activePlan: 'two-year', cartPlan: 'yearly', expectedVariant: 'monthly' },
		{ activePlan: 'two-year', cartPlan: 'yearly', expectedVariant: 'yearly' },
		{ activePlan: 'two-year', cartPlan: 'yearly', expectedVariant: 'two-year' },
	] )(
		'renders the variant picker without $expectedVariant for a $cartPlan plan when the current plan is $activePlan',
		async ( { activePlan, cartPlan, expectedVariant } ) => {
			getPlansBySiteId.mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( activePlan ),
			} ) );
			const cartChanges = { products: [ getBusinessPlanForInterval( cartPlan ) ] };
			nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/logstash' ).reply( 200 );
			render( <MyCheckout cartChanges={ cartChanges } /> );

			const renderedVariant = await waitFor( () =>
				screen.queryByText( getVariantItemTextForInterval( expectedVariant ) )
			);
			expect( renderedVariant ).not.toBeInTheDocument();
		}
	);

	it.each( [
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'yearly' },
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'two-year' },
	] )(
		'renders the $expectedVariant variant with a discount percentage for a $cartPlan plan when the current plan is $activePlan',
		async ( { activePlan, cartPlan, expectedVariant } ) => {
			getPlansBySiteId.mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( activePlan ),
			} ) );
			const cartChanges = { products: [ getBusinessPlanForInterval( cartPlan ) ] };
			render( <MyCheckout cartChanges={ cartChanges } /> );

			const variantItem = (
				await screen.findByText( getVariantItemTextForInterval( expectedVariant ) )
			 ).closest( 'label' );
			const lowestVariantItem = variantItem.closest( 'ul' ).querySelector( 'label:first-of-type' );
			const lowestVariantSlug = lowestVariantItem.closest( 'div' ).querySelector( 'input' ).value;
			const variantSlug = variantItem.closest( 'div' ).querySelector( 'input' ).value;

			const variantData = getPlansItemsState().find(
				( plan ) => plan.product_slug === variantSlug
			);
			const finalPrice = variantData.raw_price;
			const variantInterval = variantData.bill_period;
			const lowestVariantData = getPlansItemsState().find(
				( plan ) => plan.product_slug === lowestVariantSlug
			);
			const lowestVariantPrice = lowestVariantData.raw_price;
			const lowestVariantInterval = lowestVariantData.bill_period;
			const intervalsInVariant = Math.round( variantInterval / lowestVariantInterval );
			const priceBeforeDiscount = lowestVariantPrice * intervalsInVariant;

			const discountPercentage = Math.floor( 100 - ( finalPrice / priceBeforeDiscount ) * 100 );
			expect(
				within( variantItem ).getByText( `Save ${ discountPercentage }%` )
			).toBeInTheDocument();
		}
	);

	it.each( [ { activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'monthly' } ] )(
		'renders the $expectedVariant variant without a discount percentage for a $cartPlan plan when the current plan is $activePlan',
		async ( { activePlan, cartPlan, expectedVariant } ) => {
			getPlansBySiteId.mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( activePlan ),
			} ) );
			const cartChanges = { products: [ getBusinessPlanForInterval( cartPlan ) ] };
			render( <MyCheckout cartChanges={ cartChanges } /> );

			const variantItem = (
				await screen.findByText( getVariantItemTextForInterval( expectedVariant ) )
			 ).closest( 'label' );
			expect( within( variantItem ).queryByText( /Save \d+%/ ) ).not.toBeInTheDocument();
		}
	);

	it( 'does not render the variant picker if there are no variants after clicking into edit mode', async () => {
		const cartChanges = { products: [ domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		const editOrderButton = await screen.findByLabelText( 'Edit your order' );
		fireEvent.click( editOrderButton );

		expect( screen.queryByText( 'One month' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'One year' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Two years' ) ).not.toBeInTheDocument();
	} );

	it.each( [
		{ activePlan: 'yearly', cartPlan: 'monthly' },
		{ activePlan: 'monthly', cartPlan: 'yearly' },
	] )(
		'does not render the variant picker for a term change from $activePlan to $cartPlan of the current plan',
		async ( { activePlan, cartPlan } ) => {
			getPlansBySiteId.mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( activePlan ),
			} ) );
			const cartChanges = { products: [ getPersonalPlanForInterval( cartPlan ) ] };
			render( <MyCheckout cartChanges={ cartChanges } /> );

			expect( screen.queryByText( 'One month' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'One year' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Two years' ) ).not.toBeInTheDocument();
		}
	);

	it( 'does not render the variant picker for a renewal of the current plan', async () => {
		const currentPlanRenewal = { ...planWithoutDomain, extra: { purchaseType: 'renewal' } };
		const cartChanges = { products: [ currentPlanRenewal ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );
		const editOrderButton = await screen.findByLabelText( 'Edit your order' );
		fireEvent.click( editOrderButton );

		expect( screen.queryByText( 'One month' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'One year' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Two years' ) ).not.toBeInTheDocument();
	} );
} );
