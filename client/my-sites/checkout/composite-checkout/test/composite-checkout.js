/**
 * @jest-environment jsdom
 */

import { StripeHookProvider } from '@automattic/calypso-stripe';
import { ShoppingCartProvider } from '@automattic/shopping-cart';
import { render, fireEvent, screen, within, waitFor, act } from '@testing-library/react';
import page from 'page';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom/extend-expect';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import CompositeCheckout from '../composite-checkout';

/**
 * Mocked dependencies
 */
jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'calypso/state/sites/plans/selectors/get-plans-by-site' );

jest.mock( 'page', () => ( {
	redirect: jest.fn(),
} ) );

const siteId = 13579;

const domainProduct = {
	product_name: '.cash Domain',
	product_slug: 'domain_reg',
	currency: 'BRL',
	extra: {
		context: 'signup',
		domain_registration_agreement_url:
			'https://wordpress.com/automattic-domain-name-registration-agreement/',
		privacy: true,
		privacy_available: true,
		registrar: 'KS_RAM',
	},
	free_trial: false,
	meta: 'foo.cash',
	product_id: 6,
	volume: 1,
	is_domain_registration: true,
	item_original_cost_integer: 500,
	item_original_cost_display: 'R$5',
	item_subtotal_integer: 500,
	item_subtotal_display: 'R$5',
};

const domainTransferProduct = {
	product_name: '.cash Domain',
	product_slug: 'domain_transfer',
	currency: 'BRL',
	extra: {
		context: 'signup',
		domain_registration_agreement_url:
			'https://wordpress.com/automattic-domain-name-registration-agreement/',
		privacy: true,
		privacy_available: true,
		registrar: 'KS_RAM',
	},
	free_trial: false,
	meta: 'foo.cash',
	product_id: 6,
	volume: 1,
	item_original_cost_integer: 500,
	item_original_cost_display: 'R$5',
	item_subtotal_integer: 500,
	item_subtotal_display: 'R$5',
};

const planWithBundledDomain = {
	product_name: 'WordPress.com Personal',
	product_slug: 'personal-bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
		domain_to_bundle: 'foo.cash',
	},
	free_trial: false,
	meta: '',
	product_id: 1009,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
};

const planWithoutDomain = {
	product_name: 'WordPress.com Personal',
	product_slug: 'personal-bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	free_trial: false,
	meta: '',
	product_id: 1009,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
};

const planWithoutDomainMonthly = {
	product_name: 'WordPress.com Personal Monthly',
	product_slug: 'personal-bundle-monthly',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	free_trial: false,
	meta: '',
	product_id: 1019,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
};

const planWithoutDomainBiannual = {
	product_name: 'WordPress.com Personal 2 Year',
	product_slug: 'personal-bundle-2y',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	free_trial: false,
	meta: '',
	product_id: 1029,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
};

const planLevel2 = {
	product_name: 'WordPress.com Business',
	product_slug: 'business-bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	free_trial: false,
	meta: '',
	product_id: 1008,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
};

const planLevel2Monthly = {
	product_name: 'WordPress.com Business Monthly',
	product_slug: 'business-bundle-monthly',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	free_trial: false,
	meta: '',
	product_id: 1018,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
};

const planLevel2Biannual = {
	product_name: 'WordPress.com Business 2 Year',
	product_slug: 'business-bundle-2y',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	free_trial: false,
	meta: '',
	product_id: 1028,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
};

const fetchStripeConfiguration = async () => {
	return {
		public_key: 'abc123',
		js_url: 'https://js.stripe.com/v3/',
	};
};

describe( 'CompositeCheckout', () => {
	let container;
	let MyCheckout;

	beforeEach( () => {
		jest.clearAllMocks();
		getPlansBySiteId.mockImplementation( () => ( {
			data: getActivePersonalPlanDataForType( 'yearly' ),
		} ) );

		container = document.createElement( 'div' );
		document.body.appendChild( container );

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

		const countryList = [
			{
				code: 'US',
				name: 'United States',
				has_postal_codes: true,
			},
			{
				code: 'CW',
				name: 'Curacao',
				has_postal_codes: false,
			},
			{
				code: 'AU',
				name: 'Australia',
				has_postal_codes: true,
			},
		];

		const store = applyMiddleware( thunk )( createStore )( () => {
			return {
				plans: {
					items: getPlansItemsState(),
				},
				sites: { items: {} },
				siteSettings: { items: {} },
				ui: { selectedSiteId: siteId },
				productsList: {
					items: {
						[ planWithoutDomain.product_slug ]: {
							product_id: planWithoutDomain.product_id,
							product_slug: planWithoutDomain.product_slug,
							product_type: 'bundle',
							available: true,
							is_domain_registration: false,
							cost_display: planWithoutDomain.item_subtotal_display,
							currency_code: planWithoutDomain.currency,
						},
						[ planWithoutDomainMonthly.product_slug ]: {
							product_id: planWithoutDomainMonthly.product_id,
							product_slug: planWithoutDomainMonthly.product_slug,
							product_type: 'bundle',
							available: true,
							is_domain_registration: false,
							cost_display: planWithoutDomainMonthly.item_subtotal_display,
							currency_code: planWithoutDomainMonthly.currency,
						},
						[ planWithoutDomainBiannual.product_slug ]: {
							product_id: planWithoutDomainBiannual.product_id,
							product_slug: planWithoutDomainBiannual.product_slug,
							product_type: 'bundle',
							available: true,
							is_domain_registration: false,
							cost_display: planWithoutDomainBiannual.item_subtotal_display,
							currency_code: planWithoutDomainBiannual.currency,
						},
						[ planLevel2.product_slug ]: {
							product_id: planWithoutDomain.product_id,
							product_slug: planWithoutDomain.product_slug,
							product_type: 'bundle',
							available: true,
							is_domain_registration: false,
							cost_display: planWithoutDomain.item_subtotal_display,
							currency_code: planWithoutDomain.currency,
						},
						[ planLevel2Monthly.product_slug ]: {
							product_id: planLevel2Monthly.product_id,
							product_slug: planLevel2Monthly.product_slug,
							product_type: 'bundle',
							available: true,
							is_domain_registration: false,
							cost_display: planLevel2Monthly.item_subtotal_display,
							currency_code: planLevel2Monthly.currency,
						},
						[ planLevel2Biannual.product_slug ]: {
							product_id: planLevel2Biannual.product_id,
							product_slug: planLevel2Biannual.product_slug,
							product_type: 'bundle',
							available: true,
							is_domain_registration: false,
							cost_display: planLevel2Biannual.item_subtotal_display,
							currency_code: planLevel2Biannual.currency,
						},
						domain_map: {
							product_id: 5,
							product_name: 'Product',
							product_slug: 'domain_map',
						},
						domain_reg: {
							product_id: 6,
							product_name: 'Product',
							product_slug: 'domain_reg',
						},
						premium_theme: {
							product_id: 39,
							product_name: 'Product',
							product_slug: 'premium_theme',
						},
						'concierge-session': {
							product_id: 371,
							product_name: 'Product',
							product_slug: 'concierge-session',
						},
						jetpack_backup_daily: {
							product_id: 2100,
							product_name: 'Jetpack Backup (Daily)',
							product_slug: 'jetpack_backup_daily',
						},
						jetpack_scan: {
							product_id: 2106,
							product_name: 'Jetpack Scan Daily',
							product_slug: 'jetpack_scan',
						},
					},
				},
				purchases: {},
				countries: { payments: countryList, domains: countryList },
			};
		} );

		MyCheckout = ( { cartChanges, additionalProps, additionalCartProps } ) => (
			<ReduxProvider store={ store }>
				<ShoppingCartProvider
					cartKey={ 'foo.com' }
					setCart={ mockSetCartEndpoint }
					getCart={ mockGetCartEndpointWith( { ...initialCart, ...( cartChanges ?? {} ) } ) }
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
	} );

	afterEach( () => {
		document.body.removeChild( container );
		container = null;
	} );

	it( 'renders the line items with prices', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			screen
				.getAllByLabelText( 'WordPress.com Personal' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$144' ) );
		} );
	} );

	it( 'renders the tax amount', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			screen
				.getAllByLabelText( 'Tax' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$7' ) );
		} );
	} );

	it( 'renders the total amount', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			screen
				.getAllByLabelText( 'Total' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$156' ) );
		} );
	} );

	it( 'renders the paypal payment method option', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			expect( screen.getByText( 'PayPal' ) ).toBeInTheDocument();
		} );
	} );

	it( 'does not render the full credits payment method option when no credits are available', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			expect( screen.queryByText( /WordPress.com Credits:/ ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not render the full credits payment method option when partial credits are available', async () => {
		const cartChanges = { credits_integer: 15400, credits_display: 'R$154' };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.queryByText( /WordPress.com Credits:/ ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders the paypal payment method option when partial credits are available', async () => {
		const cartChanges = { credits_integer: 15400, credits_display: 'R$154' };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
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
		render( <MyCheckout cartChanges={ cartChanges } />, container );
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
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.queryByText( 'PayPal' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not render the free payment method option when the purchase is not free', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			expect( screen.queryByText( 'Free Purchase' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not render the paypal payment method option when the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
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
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.queryByText( /WordPress.com Credits:/ ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders the free payment method option when the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.getByText( 'Free Purchase' ) ).toBeInTheDocument();
		} );
	} );

	it( 'does not render the contact step when the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect(
				screen.queryByText( /Enter your (billing|contact) information/ )
			).not.toBeInTheDocument();
		} );
	} );

	it( 'renders the contact step when the purchase is not free', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			expect( screen.getByText( /Enter your (billing|contact) information/ ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders the tax fields only when no domain is in the cart', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.getByText( 'Postal code' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Country' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Phone' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Email' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders the domain fields when a domain is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.getByText( 'Country' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders the domain fields when a domain transfer is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainTransferProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.getByText( 'Country' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
		} );
	} );

	it( 'does not render country-specific domain fields when no country has been chosen and a domain is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.getByText( 'Country' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Address' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'City' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'State' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'ZIP code' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders country-specific domain fields when a country has been chosen and a domain is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			fireEvent.change( screen.getByLabelText( 'Country' ), { target: { value: 'US' } } );
		} );
		await waitFor( () => {
			expect( screen.getByText( 'Country' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Address' ) ).toBeInTheDocument();
			expect( screen.getByText( 'City' ) ).toBeInTheDocument();
			expect( screen.getByText( 'State' ) ).toBeInTheDocument();
			expect( screen.getByText( 'ZIP code' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders domain fields except postal code when a country without postal code support has been chosen and a domain is in the cart', async () => {
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			fireEvent.change( screen.getByLabelText( 'Country' ), { target: { value: 'CW' } } );
		} );
		await waitFor( () => {
			expect( screen.getByText( 'Country' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Phone' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Postal code' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders the checkout summary', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			expect( screen.getByText( 'Purchase Details' ) ).toBeInTheDocument();
			expect( page.redirect ).not.toHaveBeenCalled();
		} );
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
			render( <MyCheckout cartChanges={ cartChanges } />, container );
			const editOrderButton = await screen.findByLabelText( 'Edit your order' );
			fireEvent.click( editOrderButton );

			expect(
				screen.getByText( getVariantItemTextForInterval( expectedVariant ) )
			).toBeInTheDocument();
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
			render( <MyCheckout cartChanges={ cartChanges } />, container );
			const editOrderButton = await screen.findByLabelText( 'Edit your order' );
			fireEvent.click( editOrderButton );

			expect(
				screen.queryByText( getVariantItemTextForInterval( expectedVariant ) )
			).not.toBeInTheDocument();
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
			render( <MyCheckout cartChanges={ cartChanges } />, container );
			const editOrderButton = await screen.findByLabelText( 'Edit your order' );
			fireEvent.click( editOrderButton );

			const variantItem = screen
				.getByText( getVariantItemTextForInterval( expectedVariant ) )
				.closest( 'label' );
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

			const discountPercentage = Math.round( 100 - ( finalPrice / priceBeforeDiscount ) * 100 );
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
			render( <MyCheckout cartChanges={ cartChanges } />, container );
			const editOrderButton = await screen.findByLabelText( 'Edit your order' );
			fireEvent.click( editOrderButton );

			const variantItem = screen
				.getByText( getVariantItemTextForInterval( expectedVariant ) )
				.closest( 'label' );
			expect( within( variantItem ).queryByText( /Save \d+%/ ) ).not.toBeInTheDocument();
		}
	);

	it( 'does not render the variant picker if there are no variants after clicking into edit mode', async () => {
		const cartChanges = { products: [ domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
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
			render( <MyCheckout cartChanges={ cartChanges } />, container );
			const editOrderButton = await screen.findByLabelText( 'Edit your order' );
			fireEvent.click( editOrderButton );

			expect( screen.queryByText( 'One month' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'One year' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Two years' ) ).not.toBeInTheDocument();
		}
	);

	it( 'does not render the variant picker for a renewal of the current plan', async () => {
		const currentPlanRenewal = { ...planWithoutDomain, extra: { purchaseType: 'renewal' } };
		const cartChanges = { products: [ currentPlanRenewal ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		const editOrderButton = await screen.findByLabelText( 'Edit your order' );
		fireEvent.click( editOrderButton );

		expect( screen.queryByText( 'One month' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'One year' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Two years' ) ).not.toBeInTheDocument();
	} );

	it( 'removes a product from the cart after clicking to remove it in edit mode', async () => {
		const cartChanges = { products: [ planWithoutDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		const editOrderButton = await screen.findByLabelText( 'Edit your order' );
		fireEvent.click( editOrderButton );
		const activeSection = await screen.findByTestId( 'review-order-step--visible' );
		const removeProductButton = await within( activeSection ).findByLabelText(
			'Remove WordPress.com Personal from cart'
		);
		expect( screen.getAllByLabelText( 'WordPress.com Personal' ) ).toHaveLength( 2 );
		fireEvent.click( removeProductButton );
		const confirmModal = await screen.findByRole( 'dialog' );
		const confirmButton = await within( confirmModal ).findByText( 'Continue' );
		fireEvent.click( confirmButton );
		await waitFor( () => {
			expect( screen.queryAllByLabelText( 'WordPress.com Personal' ) ).toHaveLength( 0 );
		} );
	} );

	it( 'removes a product from the cart after clicking to remove it outside of edit mode', async () => {
		const cartChanges = { products: [ planWithoutDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		const activeSection = await screen.findByTestId( 'review-order-step--visible' );
		const removeProductButton = await within( activeSection ).findByLabelText(
			'Remove WordPress.com Personal from cart'
		);
		expect( screen.getAllByLabelText( 'WordPress.com Personal' ) ).toHaveLength( 2 );
		fireEvent.click( removeProductButton );
		const confirmModal = await screen.findByRole( 'dialog' );
		const confirmButton = await within( confirmModal ).findByText( 'Continue' );
		fireEvent.click( confirmButton );
		await waitFor( async () => {
			expect( screen.queryAllByLabelText( 'WordPress.com Personal' ) ).toHaveLength( 0 );
		} );
	} );

	it( 'redirects to the plans page if the cart is empty after removing the last product', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		const editOrderButton = await screen.findByLabelText( 'Edit your order' );
		fireEvent.click( editOrderButton );
		const activeSection = await screen.findByTestId( 'review-order-step--visible' );
		const removeProductButton = await within( activeSection ).findByLabelText(
			'Remove WordPress.com Personal from cart'
		);
		fireEvent.click( removeProductButton );
		const confirmButton = await screen.findByText( 'Continue' );
		fireEvent.click( confirmButton );
		await waitFor( () => {
			expect( page.redirect ).toHaveBeenCalledWith( '/plans/foo.com' );
		} );
	} );

	it( 'does not redirect to the plans page if the cart is empty after removing a product when it is not the last', async () => {
		const cartChanges = { products: [ planWithoutDomain, domainProduct ] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		const editOrderButton = await screen.findByLabelText( 'Edit your order' );
		fireEvent.click( editOrderButton );
		const activeSection = await screen.findByTestId( 'review-order-step--visible' );
		const removeProductButton = await within( activeSection ).findByLabelText(
			'Remove foo.cash from cart'
		);
		fireEvent.click( removeProductButton );
		const confirmButton = await screen.findByText( 'Continue' );
		fireEvent.click( confirmButton );
		await waitFor( async () => {
			expect( page.redirect ).not.toHaveBeenCalledWith( '/plans/foo.com' );
		} );
	} );

	it( 'does not redirect to the plans page if the cart is empty when it loads', async () => {
		const cartChanges = { products: [] };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( async () => {
			expect( page.redirect ).not.toHaveBeenCalledWith( '/plans/foo.com' );
		} );
	} );

	it( 'does not redirect if the cart is empty when it loads but the url has a plan alias', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'personal' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			expect( page.redirect ).not.toHaveBeenCalled();
		} );
	} );

	it( 'adds the aliased plan to the cart when the url has a plan alias', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'personal' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			screen
				.getAllByLabelText( 'WordPress.com Personal' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$144' ) );
		} );
	} );

	it( 'adds the product to the cart when the url has a jetpack product', async () => {
		isJetpackSite.mockImplementation( () => true );
		isAtomicSite.mockImplementation( () => false );

		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'jetpack_scan' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			screen
				.getAllByLabelText( 'Jetpack Scan Daily' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$41' ) );
		} );
	} );

	it( 'adds two products to the cart when the url has two jetpack products', async () => {
		isJetpackSite.mockImplementation( () => true );
		isAtomicSite.mockImplementation( () => false );

		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'jetpack_scan,jetpack_backup_daily' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			screen
				.getAllByLabelText( 'Jetpack Scan Daily' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$41' ) );
			screen
				.getAllByLabelText( 'Jetpack Backup (Daily)' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$42' ) );
		} );
	} );

	it( 'does not redirect if the cart is empty when it loads but the url has a concierge session', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'concierge-session' };
		await act( async () => {
			render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it( 'adds the domain mapping product to the cart when the url has a concierge session', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		const additionalProps = { productAliasFromUrl: 'concierge-session' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			screen
				.getAllByLabelText( 'WordPress.com Personal' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$144' ) );
			screen
				.getAllByLabelText( 'Support Session' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$49' ) );
		} );
	} );

	it( 'does not redirect if the cart is empty when it loads but the url has a theme', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'theme:ovation' };
		await act( async () => {
			render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it( 'adds the domain mapping product to the cart when the url has a theme', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		const additionalProps = { productAliasFromUrl: 'theme:ovation' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			screen
				.getAllByLabelText( 'WordPress.com Personal' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$144' ) );
			screen
				.getAllByLabelText( 'Premium Theme: Ovation' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$69' ) );
		} );
	} );

	it( 'does not redirect if the cart is empty when it loads but the url has a domain map', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'domain-mapping:bar.com' };
		await act( async () => {
			render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it( 'adds the domain mapping product to the cart when the url has a domain map', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		const additionalProps = { productAliasFromUrl: 'domain-mapping:bar.com' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			screen
				.getAllByLabelText( 'WordPress.com Personal' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$144' ) );
			expect( screen.getAllByText( 'Domain Mapping: billed annually' ) ).toHaveLength( 2 );
			screen
				.getAllByLabelText( 'bar.com' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$0' ) );
		} );
	} );

	it( 'adds renewal product to the cart when the url has a renewal', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'personal-bundle', purchaseId: '12345' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			screen
				.getAllByLabelText( 'WordPress.com Personal' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$144' ) );
		} );
	} );

	it( 'adds renewal product to the cart when the url has a renewal with a domain registration', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'domain_reg:foo.cash', purchaseId: '12345' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			expect( screen.getAllByText( 'Domain Registration: billed annually' ) ).toHaveLength( 2 );
			expect( screen.getAllByText( 'foo.cash' ) ).toHaveLength( 3 );
		} );
	} );

	it( 'adds renewal product to the cart when the url has a renewal with a domain mapping', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'domain_map:bar.com', purchaseId: '12345' };
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( async () => {
			expect( screen.getAllByText( 'Domain Mapping: billed annually' ) ).toHaveLength( 2 );
			expect( screen.getAllByText( 'bar.com' ) ).toHaveLength( 2 );
		} );
	} );

	it( 'adds renewal products to the cart when the url has multiple renewals', async () => {
		const cartChanges = { products: [] };
		const additionalProps = {
			productAliasFromUrl: 'domain_map:bar.com,domain_reg:bar.com',
			purchaseId: '12345,54321',
		};
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( () => {
			expect( screen.getAllByText( 'Domain Mapping: billed annually' ) ).toHaveLength( 2 );
			expect( screen.getAllByText( 'Domain Registration: billed annually' ) ).toHaveLength( 2 );
			expect( screen.getAllByText( 'bar.com' ) ).toHaveLength( 5 );
		} );
	} );

	it( 'adds the coupon to the cart when the url has a coupon code', async () => {
		const cartChanges = { products: [ planWithoutDomain ] };
		const additionalProps = {
			couponCode: 'MYCOUPONCODE',
			coupon_savings_total_integer: 10,
			coupon_savings_total_display: '$R10',
		};
		render(
			<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
			container
		);
		await waitFor( () => {
			screen
				.getAllByLabelText( 'WordPress.com Personal' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$144' ) );
			screen
				.getAllByLabelText( 'Coupon: MYCOUPONCODE' )
				.map( ( element ) => expect( element ).toHaveTextContent( 'R$10' ) );
		} );
	} );

	it( 'displays loading while cart key is undefined (eg: when cart store has pending updates)', async () => {
		const additionalCartProps = { cartKey: undefined };
		await act( async () => {
			render( <MyCheckout additionalCartProps={ additionalCartProps } />, container );
		} );
		expect( screen.getByText( 'Loading checkout' ) ).toBeInTheDocument();
	} );
} );

async function mockSetCartEndpoint( _, requestCart ) {
	const {
		products: requestProducts,
		currency: requestCurrency,
		coupon: requestCoupon,
		locale: requestLocale,
	} = requestCart;
	const products = requestProducts.map( convertRequestProductToResponseProduct( requestCurrency ) );

	const taxInteger = products.reduce( ( accum, current ) => {
		return accum + current.item_tax;
	}, 0 );

	const totalInteger = products.reduce( ( accum, current ) => {
		return accum + current.item_subtotal_integer;
	}, taxInteger );

	return {
		products,
		locale: requestLocale,
		currency: requestCurrency,
		credits_integer: 0,
		credits_display: '0',
		allowed_payment_methods: [ 'WPCOM_Billing_PayPal_Express' ],
		coupon_savings_total_display: requestCoupon ? 'R$10' : 'R$0',
		coupon_savings_total_integer: requestCoupon ? 1000 : 0,
		savings_total_display: requestCoupon ? 'R$10' : 'R$0',
		savings_total_integer: requestCoupon ? 1000 : 0,
		total_tax_display: 'R$7',
		total_tax_integer: taxInteger,
		total_cost_display: 'R$156',
		total_cost_integer: totalInteger,
		sub_total_display: 'R$149',
		sub_total_integer: totalInteger - taxInteger,
		coupon: requestCoupon,
		is_coupon_applied: true,
		coupon_discounts_integer: [],
		tax: { location: {}, display_taxes: true },
	};
}

function convertRequestProductToResponseProduct( currency ) {
	return ( product ) => {
		const { product_id } = product;

		switch ( product_id ) {
			case 1009: // WPCOM Personal Bundle
				return {
					product_id: 1009,
					product_name: 'WordPress.com Personal',
					product_slug: 'personal-bundle',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 14400,
					item_original_cost_display: 'R$144',
					item_subtotal_integer: 14400,
					item_subtotal_display: 'R$144',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 5:
				return {
					product_id: 5,
					product_name: 'Domain Mapping',
					product_slug: 'domain_map',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 0,
					item_original_cost_display: 'R$0',
					item_subtotal_integer: 0,
					item_subtotal_display: 'R$0',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 6:
				return {
					product_id: 6,
					product_name: 'Domain Registration',
					product_slug: 'domain_reg',
					currency: currency,
					is_domain_registration: true,
					item_original_cost_integer: 70,
					item_original_cost_display: 'R$70',
					item_subtotal_integer: 70,
					item_subtotal_display: 'R$70',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 39:
				return {
					product_id: 39,
					product_name: 'Premium Theme: Ovation',
					product_slug: 'premium_theme',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 69,
					item_original_cost_display: 'R$69',
					item_subtotal_integer: 69,
					item_subtotal_display: 'R$69',
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 371:
				return {
					product_id: 371,
					product_name: 'Support Session',
					product_slug: 'concierge-session',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 49,
					item_original_cost_display: 'R$49',
					item_subtotal_integer: 49,
					item_subtotal_display: 'R$49',
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 2106:
				return {
					product_id: 2106,
					product_name: 'Jetpack Scan Daily',
					product_slug: 'jetpack_scan',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 4100,
					item_original_cost_display: 'R$41',
					item_subtotal_integer: 4100,
					item_subtotal_display: 'R$41',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 2100:
				return {
					product_id: 2100,
					product_name: 'Jetpack Backup (Daily)',
					product_slug: 'jetpack_backup_daily',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 4200,
					item_original_cost_display: 'R$42',
					item_subtotal_integer: 4200,
					item_subtotal_display: 'R$42',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
		}

		return {
			product_id: product_id,
			product_name: `Unknown mocked product: ${ product_id }`,
			product_slug: 'unknown',
			currency: currency,
			is_domain_registration: false,
			savings_total_display: '$0',
			savings_total_integer: 0,
			item_subtotal_display: '$0',
			item_subtotal_integer: 0,
			item_tax: 0,
		};
	};
}

function mockGetCartEndpointWith( initialCart ) {
	return async () => {
		return initialCart;
	};
}

function getActivePersonalPlanDataForType( type ) {
	switch ( type ) {
		case 'none':
			return null;
		case 'monthly':
			return [
				{
					interval: 30,
					productSlug: planWithoutDomainMonthly.product_slug,
					currentPlan: true,
				},
			];
		case 'yearly':
			return [
				{
					interval: 365,
					productSlug: planWithoutDomain.product_slug,
					currentPlan: true,
				},
			];
		case 'two-year':
			return [
				{
					interval: 730,
					productSlug: planWithoutDomainBiannual.product_slug,
					currentPlan: true,
				},
			];
		default:
			throw new Error( `Unknown plan type '${ type }'` );
	}
}

function getPersonalPlanForInterval( type ) {
	switch ( type ) {
		case 'monthly':
			return planWithoutDomainMonthly;
		case 'yearly':
			return planWithoutDomain;
		case 'two-year':
			return planWithoutDomainBiannual;
		default:
			throw new Error( `Unknown plan type '${ type }'` );
	}
}

function getBusinessPlanForInterval( type ) {
	switch ( type ) {
		case 'monthly':
			return planLevel2Monthly;
		case 'yearly':
			return planLevel2;
		case 'two-year':
			return planLevel2Biannual;
		default:
			throw new Error( `Unknown plan type '${ type }'` );
	}
}

function getVariantItemTextForInterval( type ) {
	switch ( type ) {
		case 'monthly':
			return 'One month';
		case 'yearly':
			return 'One year';
		case 'two-year':
			return 'Two years';
		default:
			throw new Error( `Unknown plan type '${ type }'` );
	}
}

function getPlansItemsState() {
	return [
		{
			product_id: planWithoutDomain.product_id,
			product_slug: planWithoutDomain.product_slug,
			bill_period: 365,
			product_type: 'bundle',
			available: true,
			price: '$48',
			formatted_price: '$48',
			raw_price: 48,
		},
		{
			product_id: planWithoutDomainMonthly.product_id,
			product_slug: planWithoutDomainMonthly.product_slug,
			bill_period: 30,
			product_type: 'bundle',
			available: true,
			price: '$7',
			formatted_price: '$7',
			raw_price: 7,
		},
		{
			product_id: planWithoutDomainBiannual.product_id,
			product_slug: planWithoutDomainBiannual.product_slug,
			bill_period: 730,
			product_type: 'bundle',
			available: true,
			price: '$84',
			formatted_price: '$84',
			raw_price: 84,
		},
		{
			product_id: planLevel2.product_id,
			product_slug: planLevel2.product_slug,
			bill_period: 365,
			product_type: 'bundle',
			available: true,
			price: '$300',
			formatted_price: '$300',
			raw_price: 300,
		},
		{
			product_id: planLevel2Monthly.product_id,
			product_slug: planLevel2Monthly.product_slug,
			bill_period: 30,
			product_type: 'bundle',
			available: true,
			price: '$33',
			formatted_price: '$33',
			raw_price: 33,
		},
		{
			product_id: planLevel2Biannual.product_id,
			product_slug: planLevel2Biannual.product_slug,
			bill_period: 730,
			product_type: 'bundle',
			available: true,
			price: '$499',
			formatted_price: '$499',
			raw_price: 499,
		},
	];
}
