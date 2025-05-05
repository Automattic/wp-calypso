/**
 * @jest-environment jsdom
 */

import { formatCurrency } from '@automattic/number-formatters';
// @ts-nocheck - TODO: Fix TypeScript issues
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch } from '@wordpress/data';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import useCartKey from '../../use-cart-key';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import {
	domainProduct,
	planWithoutDomain,
	getActivePersonalPlanDataForType,
	getBusinessPlanForInterval,
	getJetpackPlanForInterval,
	getVariantItemTextForInterval,
	getPlansItemsState,
	countryList,
	mockUserAgent,
	getPlanSubtitleTextForInterval,
	mockGetPaymentMethodsEndpoint,
	mockLogStashEndpoint,
	mockGetSupportedCountriesEndpoint,
	mockGetVatInfoEndpoint,
	mockMatchMediaOnWindow,
	getBasicCart,
} from './util';
import { MockCheckout } from './util/mock-checkout';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

jest.mock( 'calypso/lib/analytics/utils/refresh-country-code-cookie-gdpr' );
jest.mock( 'calypso/my-sites/checkout/use-cart-key' );
jest.mock( 'calypso/state/products-list/selectors' );
jest.mock( 'calypso/state/selectors/get-intro-offer-price' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'calypso/state/sites/domains/selectors' );
jest.mock( 'calypso/state/sites/plans/selectors/get-plans-by-site' );
jest.mock( 'calypso/state/sites/selectors' );

// These tests seem to be particularly slow (it might be because of using
// it.each; it's not clear but the timeout might apply to the whole loop
// rather that each iteration?), so we need to increase the timeout for their
// operation. The standard timeout (at the time of writing) is 5 seconds so
// we are increasing this to 12 seconds.
jest.setTimeout( 12000 );

/* eslint-disable jest/no-conditional-expect */

describe( 'CheckoutMain with a variant picker', () => {
	const initialCart = getBasicCart();
	const mainCartKey = 123456;

	beforeEach( () => {
		dispatch( CHECKOUT_STORE ).reset();
		jest.clearAllMocks();
		( getPlansBySiteId as jest.Mock ).mockImplementation( () => ( {
			data: getActivePersonalPlanDataForType( 'yearly' ),
		} ) );
		( hasLoadedSiteDomains as unknown as jest.Mock ).mockImplementation( () => true );
		( getDomainsBySiteId as unknown as jest.Mock ).mockImplementation( () => [] );
		( isMarketplaceProduct as unknown as jest.Mock ).mockImplementation( () => false );
		( isJetpackSite as unknown as jest.Mock ).mockImplementation( () => false );
		( useCartKey as unknown as jest.Mock ).mockImplementation( () => mainCartKey );

		mockGetPaymentMethodsEndpoint( [] );
		mockLogStashEndpoint();
		mockGetSupportedCountriesEndpoint( countryList );
		mockGetVatInfoEndpoint( {} );
		mockMatchMediaOnWindow();
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
			( getPlansBySiteId as jest.Mock ).mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( activePlan ),
			} ) );
			const user = userEvent.setup();
			const cartChanges = { products: [ getBusinessPlanForInterval( cartPlan ) ] };
			render( <MockCheckout initialCart={ initialCart } cartChanges={ cartChanges } /> );

			const openVariantPicker = await screen.findByLabelText( 'Pick a product term' );
			await user.click( openVariantPicker );

			expect(
				await screen.findByRole( 'option', {
					name: getVariantItemTextForInterval( expectedVariant ),
				} )
			).toBeVisible();
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
			( getPlansBySiteId as jest.Mock ).mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( 'none' ),
			} ) );
			const user = userEvent.setup();
			const cartChanges = { products: [ getBusinessPlanForInterval( initialPlan ) ] };
			render( <MockCheckout initialCart={ initialCart } cartChanges={ cartChanges } /> );

			// Open the variant picker
			let openVariantPicker = await screen.findByLabelText( 'Pick a product term' );
			await user.click( openVariantPicker );

			// Select the new variant
			const variantOption = await screen.findByLabelText(
				getVariantItemTextForInterval( cartPlan )
			);
			await user.click( variantOption );

			// Wait for the cart to refresh with the new variant
			await screen.findByText( getPlanSubtitleTextForInterval( cartPlan ) );

			// Open the variant picker again so we can look for the result
			openVariantPicker = await screen.findByLabelText( 'Pick a product term' );
			await user.click( openVariantPicker );

			expect(
				await screen.findByRole( 'option', {
					name: getVariantItemTextForInterval( expectedVariant ),
				} )
			).toBeVisible();
		}
	);

	it.each( [
		{ activePlan: 'yearly', cartPlan: 'yearly', expectedVariant: 'monthly' },
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'monthly' },
	] )(
		'renders the variant picker without a $expectedVariant variant when the cart contains a $cartPlan plan and the current plan is $activePlan',
		async ( { activePlan, cartPlan, expectedVariant } ) => {
			( getPlansBySiteId as jest.Mock ).mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( activePlan ),
			} ) );
			const user = userEvent.setup();
			const cartChanges = { products: [ getBusinessPlanForInterval( cartPlan ) ] };
			render( <MockCheckout initialCart={ initialCart } cartChanges={ cartChanges } /> );

			const openVariantPicker = await screen.findByLabelText( 'Pick a product term' );
			await user.click( openVariantPicker );

			await expect(
				screen.findByRole( 'option', {
					name: getVariantItemTextForInterval( expectedVariant ),
				} )
			).toNeverAppear();
		}
	);

	it.each( [
		{ activePlan: 'none', cartPlan: 'monthly', expectedVariant: 'yearly' },
		{ activePlan: 'none', cartPlan: 'monthly', expectedVariant: 'two-year' },
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'monthly' },
		{ activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'two-year' },
		{ activePlan: 'none', cartPlan: 'two-year', expectedVariant: 'monthly' },
	] )(
		'renders the $expectedVariant variant with a discount percentage for a Jetpack $cartPlan plan when the current plan is $activePlan',
		async ( { cartPlan, expectedVariant } ) => {
			const user = userEvent.setup();
			const cartChanges = {
				products: [ getJetpackPlanForInterval( cartPlan ) ].filter(
					Boolean
				) as ResponseCartProduct[],
			};
			render( <MockCheckout initialCart={ initialCart } cartChanges={ cartChanges } /> );

			const openVariantPicker = await screen.findByLabelText( 'Pick a product term' );
			await user.click( openVariantPicker );

			const variantItem = await screen.findByRole( 'option', {
				name: getVariantItemTextForInterval( expectedVariant ),
			} );

			const variantSlug = variantItem.dataset.productSlug;

			const variantData = getPlansItemsState().find(
				( plan ) => plan.product_slug === variantSlug
			);

			const discountAmount = variantData!.orig_cost_integer / 2; // hardcoded: 50%
			const formattedDiscountAmount = formatCurrency( discountAmount, variantData!.currency_code, {
				stripZeros: true,
				isSmallestUnit: true,
			} );

			if ( discountAmount > 0 ) {
				expect(
					within( variantItem ).getByText( `Save ${ formattedDiscountAmount }` )
				).toBeInTheDocument();
			} else {
				expect(
					within( variantItem ).queryByText( `Save ${ formattedDiscountAmount }` )
				).not.toBeInTheDocument();
			}
		}
	);

	it.each( [ { activePlan: 'none', cartPlan: 'yearly', expectedVariant: 'two-year' } ] )(
		'renders the $expectedVariant variant with a discount percentage for a $cartPlan plan when the current plan is $activePlan',
		async ( { activePlan, cartPlan, expectedVariant } ) => {
			( getPlansBySiteId as jest.Mock ).mockImplementation( () => ( {
				data: getActivePersonalPlanDataForType( activePlan ),
			} ) );
			const user = userEvent.setup();
			const cartChanges = { products: [ getBusinessPlanForInterval( cartPlan ) ] };
			render( <MockCheckout initialCart={ initialCart } cartChanges={ cartChanges } /> );

			const openVariantPicker = await screen.findByLabelText( 'Pick a product term' );
			await user.click( openVariantPicker );

			const currentVariantItem = await screen.findByRole( 'option', {
				name: getVariantItemTextForInterval( cartPlan ),
			} );
			const variantItem = await screen.findByRole( 'option', {
				name: getVariantItemTextForInterval( expectedVariant ),
			} );

			const currentVariantSlug = currentVariantItem.dataset.productSlug;
			const variantSlug = variantItem.dataset.productSlug;

			const variantData = getPlansItemsState().find(
				( plan ) => plan.product_slug === variantSlug
			);
			const finalPrice = variantData!.raw_price;
			const variantInterval = parseInt( String( variantData!.bill_period ), 10 );
			const currentVariantData = getPlansItemsState().find(
				( plan ) => plan.product_slug === currentVariantSlug
			);
			const currentVariantPrice = currentVariantData!.raw_price;
			const currentVariantInterval = parseInt( String( currentVariantData!.bill_period ), 10 );
			const intervalsInVariant = Math.round( variantInterval / currentVariantInterval );
			const priceBeforeDiscount = currentVariantPrice * intervalsInVariant;

			const discountPercentage = Math.round( 100 - ( finalPrice / priceBeforeDiscount ) * 100 );
			expect(
				within( variantItem ).getByText( `Save ${ discountPercentage }%` )
			).toBeInTheDocument();
		}
	);

	it( 'does not render the variant picker if there are no variants', async () => {
		const cartChanges = { products: [ domainProduct ] };
		render( <MockCheckout initialCart={ initialCart } cartChanges={ cartChanges } /> );

		await expect( screen.findByLabelText( 'Pick a product term' ) ).toNeverAppear();
	} );

	it( 'does not render the variant picker for a renewal of the current plan', async () => {
		const currentPlanRenewal = { ...planWithoutDomain, extra: { purchaseType: 'renewal' } };
		const cartChanges = { products: [ currentPlanRenewal ] };
		render( <MockCheckout initialCart={ initialCart } cartChanges={ cartChanges } /> );

		await expect( screen.findByLabelText( 'Pick a product term' ) ).toNeverAppear();
	} );

	it( 'does not render the variant picker when userAgent is Woo mobile', async () => {
		( getPlansBySiteId as jest.Mock ).mockImplementation( () => ( {
			data: getActivePersonalPlanDataForType( 'none' ),
		} ) );
		const cartChanges = { products: [ getBusinessPlanForInterval( 'yearly' ) ] };

		mockUserAgent( 'wc-ios' );
		render( <MockCheckout initialCart={ initialCart } cartChanges={ cartChanges } /> );

		await expect(
			screen.findByLabelText( 'Change the billing term for this product' )
		).toNeverAppear();
	} );
} );
