/**
 * @jest-environment jsdom
 */
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { ShoppingCartProvider, createShoppingCartManagerClient } from '@automattic/shopping-cart';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import CheckoutMain from '../components/checkout-main';
import {
	siteId,
	domainProduct,
	planWithoutDomain,
	fetchStripeConfiguration,
	mockSetCartEndpointWith,
	mockGetCartEndpointWith,
	getActivePersonalPlanDataForType,
	getBusinessPlanForInterval,
	getVariantItemTextForInterval,
	getPlansItemsState,
	createTestReduxStore,
	countryList,
	mockUserAgent,
	getPlanSubtitleTextForInterval,
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

describe( 'CheckoutMain with a variant picker', () => {
	let MyCheckout;

	beforeEach( () => {
		jest.clearAllMocks();
		getPlansBySiteId.mockImplementation( () => ( {
			data: getActivePersonalPlanDataForType( 'yearly' ),
		} ) );
		hasLoadedSiteDomains.mockImplementation( () => true );
		getDomainsBySiteId.mockImplementation( () => [] );
		isMarketplaceProduct.mockImplementation( () => false );

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
		const queryClient = new QueryClient();
		nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/logstash' ).reply( 200 );
		nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.1/me/vat-info' ).reply( 200, {} );
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
					<QueryClientProvider client={ queryClient }>
						<ShoppingCartProvider
							managerClient={ managerClient }
							options={ {
								defaultCartKey: useUndefinedCartKey ? undefined : mainCartKey,
							} }
							{ ...additionalCartProps }
						>
							<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfiguration }>
								<CheckoutMain
									forceRadioButtons={ true }
									siteId={ siteId }
									siteSlug="foo.com"
									getStoredCards={ async () => [] }
									overrideCountryList={ countryList }
									{ ...additionalProps }
								/>
							</StripeHookProvider>
						</ShoppingCartProvider>
					</QueryClientProvider>
				</ReduxProvider>
			);
		};
	} );

	it.each( [
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'yearly' },
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'two-year' },
		{ activePlan: 'yearly', cartPlan: 'yearly', expectedVariant: 'yearly' },
		{ activePlan: 'yearly', cartPlan: 'yearly', expectedVariant: 'two-year' },
		{ activePlan: 'monthly', cartPlan: 'yearly', expectedVariant: 'yearly' },
		{ activePlan: 'monthly', cartPlan: 'yearly', expectedVariant: 'two-year' },
	] )(
		'renders the variant picker with a $expectedVariant variant when the cart contains a $cartPlan plan and the current plan is $activePlan',
		async ( { activePlan, cartPlan, expectedVariant } ) => {
			getPlansBySiteId.mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( activePlan ),
			} ) );
			const cartChanges = { products: [ getBusinessPlanForInterval( cartPlan ) ] };
			render( <MyCheckout cartChanges={ cartChanges } /> );

			await screen.findByLabelText( 'Pick a product term' );

			expect(
				await screen.findByRole( 'radio', {
					name: getVariantItemTextForInterval( expectedVariant ),
				} )
			).toBeInTheDocument();
		}
	);

	it.each( [
		{ initialPlan: 'yearly', cartPlan: 'yearly', expectedVariant: 'yearly' },
		{ initialPlan: 'yearly', cartPlan: 'yearly', expectedVariant: 'two-year' },
		{ initialPlan: 'monthly', cartPlan: 'yearly', expectedVariant: 'monthly' },
		{ initialPlan: 'yearly', cartPlan: 'two-year', expectedVariant: 'yearly' },
	] )(
		'renders the variant picker with a $expectedVariant variant when the cart initially contains $initialPlan and then is changed to $cartPlan',
		async ( { initialPlan, cartPlan, expectedVariant } ) => {
			getPlansBySiteId.mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( 'none' ),
			} ) );
			const user = userEvent.setup();
			const cartChanges = { products: [ getBusinessPlanForInterval( initialPlan ) ] };
			render( <MyCheckout cartChanges={ cartChanges } /> );

			// Open the variant picker
			await screen.findByLabelText( 'Pick a product term' );

			// Select the new variant
			const variantOption = await screen.findByLabelText(
				getVariantItemTextForInterval( cartPlan )
			);
			await user.click( variantOption );

			// Wait for the cart to refresh with the new variant
			await screen.findByText( getPlanSubtitleTextForInterval( cartPlan ) );

			expect(
				await screen.findByRole( 'radio', {
					name: getVariantItemTextForInterval( expectedVariant ),
				} )
			).toBeInTheDocument();
		}
	);

	it.each( [
		{ activePlan: 'yearly', cartPlan: 'yearly', expectedVariant: 'monthly' },
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'monthly' },
	] )(
		'renders the variant picker without a $expectedVariant variant when the cart contains a $cartPlan plan and the current plan is $activePlan',
		async ( { activePlan, cartPlan, expectedVariant } ) => {
			getPlansBySiteId.mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( activePlan ),
			} ) );
			const cartChanges = { products: [ getBusinessPlanForInterval( cartPlan ) ] };
			nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/logstash' ).reply( 200 );
			nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.1/me/vat-info' ).reply( 200, {} );
			render( <MyCheckout cartChanges={ cartChanges } /> );

			await screen.findByLabelText( 'Pick a product term' );

			await expect(
				screen.findByRole( 'radio', {
					name: getVariantItemTextForInterval( expectedVariant ),
				} )
			).toNeverAppear();
		}
	);

	it.each( [ { activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'two-year' } ] )(
		'renders the $expectedVariant variant with a discount percentage for a $cartPlan plan when the current plan is $activePlan',
		async ( { activePlan, cartPlan, expectedVariant } ) => {
			getPlansBySiteId.mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( activePlan ),
			} ) );
			const cartChanges = { products: [ getBusinessPlanForInterval( cartPlan ) ] };
			render( <MyCheckout cartChanges={ cartChanges } /> );

			const variantPicker = await screen.findByLabelText( 'Pick a product term' );

			const currentVariantItem = await screen.findByRole( 'radio', {
				name: getVariantItemTextForInterval( cartPlan ),
			} );
			const variantItem = await screen.findByRole( 'radio', {
				name: getVariantItemTextForInterval( expectedVariant ),
			} );
			const variantItemLabel = variantPicker.querySelector( `label[for='${ variantItem.id }']` );

			const currentVariantSlug = currentVariantItem.dataset.productSlug;
			const variantSlug = variantItem.dataset.productSlug;

			const variantData = getPlansItemsState().find(
				( plan ) => plan.product_slug === variantSlug
			);
			const finalPrice = variantData.raw_price;
			const variantInterval = parseInt( variantData.bill_period, 10 );
			const currentVariantData = getPlansItemsState().find(
				( plan ) => plan.product_slug === currentVariantSlug
			);
			const currentVariantPrice = currentVariantData.raw_price;
			const currentVariantInterval = parseInt( currentVariantData.bill_period, 10 );
			const intervalsInVariant = Math.round( variantInterval / currentVariantInterval );
			const priceBeforeDiscount = currentVariantPrice * intervalsInVariant;

			const discountPercentage = Math.floor( 100 - ( finalPrice / priceBeforeDiscount ) * 100 );
			expect(
				within( variantItemLabel as HTMLElement ).getByText( `Save ${ discountPercentage }%` )
			).toBeInTheDocument();
		}
	);

	it( 'does not render the variant picker if there are no variants', async () => {
		const cartChanges = { products: [ domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );

		await expect( screen.findByLabelText( 'Pick a product term' ) ).toNeverAppear();
	} );

	it( 'does not render the variant picker for a renewal of the current plan', async () => {
		const currentPlanRenewal = { ...planWithoutDomain, extra: { purchaseType: 'renewal' } };
		const cartChanges = { products: [ currentPlanRenewal ] };
		render( <MyCheckout cartChanges={ cartChanges } /> );

		await expect( screen.findByLabelText( 'Pick a product term' ) ).toNeverAppear();
	} );

	it( 'does not render the variant picker when userAgent is Woo mobile', async () => {
		getPlansBySiteId.mockImplementation( () => ( {
			data: getActivePersonalPlanDataForType( 'none' ),
		} ) );
		const cartChanges = { products: [ getBusinessPlanForInterval( 'yearly' ) ] };

		mockUserAgent( 'wc-ios' );
		render( <MyCheckout cartChanges={ cartChanges } /> );

		await expect(
			screen.findByLabelText( 'Change the billing term for this product' )
		).toNeverAppear();
	} );
} );
