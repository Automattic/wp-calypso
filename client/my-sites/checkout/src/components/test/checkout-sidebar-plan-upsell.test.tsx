/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/composite-checkout', () => ( {
	FormStatus: {
		READY: 'ready',
		LOADING: 'loading',
		VALIDATING: 'validating',
		SUBMITTING: 'submitting',
	},
	useFormStatus: jest.fn(),
} ) );

jest.mock( '@automattic/shopping-cart', () => ( {
	useShoppingCart: jest.fn(),
} ) );

jest.mock( 'calypso/my-sites/checkout/use-cart-key', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( 'calypso/state', () => ( { useDispatch: jest.fn( () => jest.fn() ) } ) );

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: () => ( { type: 'NOOP_RECORD_TRACKS_EVENT' } ),
} ) );

jest.mock( '../../hooks/product-variants', () => ( {
	useGetProductVariants: jest.fn(),
} ) );

jest.mock( '@wordpress/react-i18n', () => ( {
	useI18n: jest.fn( () => ( { __: ( s: string ) => s } ) ),
} ) );

jest.mock( '../wp-checkout-order-summary', () => ( {
	CheckoutSummaryFeaturedList: () => null,
} ) );

jest.mock( '@automattic/calypso-products', () => ( {
	isPlan: ( product: { product_slug: string } ) => product.product_slug === 'personal-bundle',
	isJetpackPlan: () => false,
} ) );

jest.mock( 'calypso/components/promo-section/promo-card', () => {
	return function MockPromoCard( props: {
		title: React.ReactNode;
		children: React.ReactNode;
		className?: string;
	} ) {
		const React = require( 'react' );
		return React.createElement(
			'div',
			{ className: props.className },
			props.title,
			props.children
		);
	};
} );

jest.mock( 'calypso/components/promo-section/promo-card/cta', () => {
	return function MockPromoCardCTA( props: {
		cta: { text: React.ReactNode; action: () => void; disabled: boolean };
	} ) {
		const React = require( 'react' );
		return React.createElement(
			'button',
			{ onClick: props.cta.action, disabled: props.cta.disabled },
			props.cta.text
		);
	};
} );

import { useFormStatus } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { render, screen } from '@testing-library/react';
import { useGetProductVariants } from '../../hooks/product-variants';
import { CheckoutSidebarPlanUpsell } from '../checkout-sidebar-plan-upsell';
import type { WPCOMProductVariant } from '../item-variation-picker/types';
import type React from 'react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeVariant( overrides: Partial< WPCOMProductVariant > = {} ): WPCOMProductVariant {
	return {
		priceInteger: 24000,
		priceBeforeDiscounts: 24000,
		termIntervalInMonths: 12,
		termIntervalInDays: 365,
		productBillingTermInMonths: 12,
		productId: 1009,
		productSlug: 'personal-bundle',
		currency: 'USD',
		variantLabel: { noun: 'Year', adjective: 'Annual' },
		introductoryInterval: 0,
		introductoryTerm: 'year',
		...overrides,
	};
}

function makeCartWithPlan( productId: number ) {
	return {
		products: [
			{
				product_slug: 'personal-bundle',
				product_id: productId,
				uuid: 'plan-001',
			},
		],
	};
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe( 'CheckoutSidebarPlanUpsell', () => {
	beforeEach( () => {
		( useFormStatus as jest.Mock ).mockReturnValue( { formStatus: 'ready' } );
		( useShoppingCart as jest.Mock ).mockReturnValue( {
			responseCart: makeCartWithPlan( 1009 ),
			replaceProductInCart: jest.fn(),
		} );
		( useGetProductVariants as jest.Mock ).mockReturnValue( [] );
	} );

	it( 'renders nothing when the cart has no plan', () => {
		( useShoppingCart as jest.Mock ).mockReturnValue( {
			responseCart: {
				products: [ { product_slug: 'domain_reg', product_id: 6, uuid: 'd-001' } ],
			},
			replaceProductInCart: jest.fn(),
		} );
		const { container } = render( <CheckoutSidebarPlanUpsell /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing when there is no higher billing term to upsell to', () => {
		// Only one variant — no higher term exists.
		( useGetProductVariants as jest.Mock ).mockReturnValue( [
			makeVariant( { productBillingTermInMonths: 12, termIntervalInMonths: 12, productId: 1009 } ),
		] );
		const { container } = render( <CheckoutSidebarPlanUpsell /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing when the upsell plan offers no savings over the current plan', () => {
		// Both variants have equal regularPricePerMonth (derived from priceBeforeDiscounts)
		// and no intro offers, so calculateDiscountPercentage returns undefined → percentSavings=0.
		( useGetProductVariants as jest.Mock ).mockReturnValue( [
			makeVariant( {
				productBillingTermInMonths: 1,
				termIntervalInMonths: 1,
				productId: 1009,
				priceInteger: 2000,
				priceBeforeDiscounts: 2000,
				introductoryInterval: 0,
			} ),
			makeVariant( {
				productBillingTermInMonths: 12,
				termIntervalInMonths: 12,
				productId: 1010,
				priceInteger: 24000,
				priceBeforeDiscounts: 24000,
				introductoryInterval: 0,
			} ),
		] );
		const { container } = render( <CheckoutSidebarPlanUpsell /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	describe( 'monthly plan → annual plan with intro offer', () => {
		// Monthly plan: $20/month, no intro offer.
		// Annual plan: $120/year intro price, $240/year regular price.
		//   12000¢ / 12 months = 1000¢/month (exact, no rounding)
		//
		// currentPlanPrice             = getPlanPriceForDuration(monthlyInfo, 1)  = 1 × 2000¢  = $20
		// currentPlanPriceAtUpsellTerm = getPlanPriceForDuration(monthlyInfo, 12) = 12 × 2000¢ = $240
		// upsellPlanPrice              = getPlanPriceForDuration(annualInfo, 12)  = 12 × 1000¢ = $120
		// percentSavings               = floor((24000 – 12000) / 24000 × 100)    = 50
		//
		// Displayed upsell price uses upsellVariant.priceInteger directly = $120.

		beforeEach( () => {
			( useGetProductVariants as jest.Mock ).mockReturnValue( [
				makeVariant( {
					productBillingTermInMonths: 1,
					termIntervalInMonths: 1,
					productId: 1009,
					priceInteger: 2000,
					priceBeforeDiscounts: 2000,
					introductoryInterval: 0,
					variantLabel: { noun: 'Month', adjective: 'Monthly' },
				} ),
				makeVariant( {
					productBillingTermInMonths: 12,
					termIntervalInMonths: 12,
					productId: 1010,
					// Intro offer: $120/yr intro, $240/yr regular. 12000/12 = 1000 exactly.
					priceInteger: 12000,
					priceBeforeDiscounts: 24000,
					introductoryInterval: 1,
					introductoryTerm: 'year',
					variantLabel: { noun: 'Year', adjective: 'Annual' },
				} ),
			] );
		} );

		it( 'shows the current plan price for its own billing term', () => {
			render( <CheckoutSidebarPlanUpsell /> );
			expect( screen.getByText( '$20' ) ).toBeVisible();
		} );

		it( 'shows the struck-through "what you would pay" comparison price', () => {
			render( <CheckoutSidebarPlanUpsell /> );
			const struckThrough = screen.getByText( '$240' );
			expect( struckThrough ).toBeVisible();
			expect( struckThrough.closest( 'del' ) ).not.toBeNull();
		} );

		it( 'shows the upsell plan price', () => {
			render( <CheckoutSidebarPlanUpsell /> );
			expect( screen.getByText( '$120' ) ).toBeVisible();
		} );
	} );

	describe( 'annual plan with 1-year intro → biennial plan with 2-year intro', () => {
		// Annual: $120/yr intro price, $240/yr regular. 12000/12 = 1000¢/month (exact).
		// Biennial: $240/2yr intro price, $480/2yr regular. 24000/24 = 1000¢/month (exact).
		//
		// currentPlanPrice             = getPlanPriceForDuration(annualInfo, 12)  = 12 × 1000¢ = $120
		// currentPlanPriceAtUpsellTerm = getPlanPriceForDuration(annualInfo, 24)  = 12 × 1000¢ + 12 × 2000¢ = $360
		// upsellPlanPrice              = getPlanPriceForDuration(biennialInfo, 24) = 24 × 1000¢ = $240
		// percentSavings               = floor((36000 – 24000) / 36000 × 100) = 33
		//
		// Previously the removed isComparisonWithIntroOffer guard produced the current-plan price
		// as priceInteger + priceBeforeDiscounts = 12000 + 24000 = 36000¢ = $360, which equals the
		// struck-through comparison and was the 2-year total at annual rates, not the 1-year intro price.
		// The new code uses getPlanPriceForDuration(currentInfo, currentInfo.termMonths) = $120.

		beforeEach( () => {
			( useGetProductVariants as jest.Mock ).mockReturnValue( [
				makeVariant( {
					productBillingTermInMonths: 12,
					termIntervalInMonths: 12,
					productId: 1009,
					// Intro offer: $120/yr intro, $240/yr regular. 12000/12 = 1000 exactly.
					priceInteger: 12000,
					priceBeforeDiscounts: 24000,
					introductoryInterval: 1,
					introductoryTerm: 'year',
					variantLabel: { noun: 'Year', adjective: 'Annual' },
				} ),
				makeVariant( {
					productBillingTermInMonths: 24,
					termIntervalInMonths: 24,
					productId: 1010,
					// Intro offer: $240/2yr intro, $480/2yr regular. 24000/24 = 1000 exactly.
					priceInteger: 24000,
					priceBeforeDiscounts: 48000,
					introductoryInterval: 2,
					introductoryTerm: 'year',
					variantLabel: { noun: 'Two years', adjective: 'Two-year' },
				} ),
			] );
		} );

		it( 'shows the intro-offer-aware current plan price ($120, not the 2-year total $360)', () => {
			render( <CheckoutSidebarPlanUpsell /> );
			// New: getPlanPriceForDuration uses the intro offer → 12 × 1000¢ = $120.
			const currentPrice = screen.getByText( '$120' );
			expect( currentPrice ).toBeVisible();
			// Old code: priceInteger (12000¢) + priceBeforeDiscounts (24000¢) = 36000¢ = $360.
			// $360 still appears in the DOM as the struck-through comparison, so we verify
			// that $120 is NOT inside a <del> (i.e. it is the current-plan Row 1, not the comparison).
			expect( currentPrice.closest( 'del' ) ).toBeNull();
		} );

		it( 'shows the struck-through comparison price (2 years at annual rates)', () => {
			render( <CheckoutSidebarPlanUpsell /> );
			const struckThrough = screen.getByText( '$360' );
			expect( struckThrough ).toBeVisible();
			expect( struckThrough.closest( 'del' ) ).not.toBeNull();
		} );

		it( 'shows the upsell plan price', () => {
			render( <CheckoutSidebarPlanUpsell /> );
			// upsellVariant.priceInteger = 24000¢ = $240.
			expect( screen.getByText( '$240' ) ).toBeVisible();
		} );

		it( 'displays the exact current plan priceInteger when the term price does not divide evenly by months', () => {
			// priceInteger=10000¢, termIntervalInMonths=12: 10000/12 = 833.33¢/month.
			// getPlanPriceForDuration would accumulate 12 × 833 = 9996¢ = $99.96 (rounded down by 4¢).
			// The component must show the exact priceInteger = 10000¢ = $100.00 instead.
			( useGetProductVariants as jest.Mock ).mockReturnValue( [
				makeVariant( {
					productBillingTermInMonths: 12,
					termIntervalInMonths: 12,
					productId: 1009,
					priceInteger: 10000,
					priceBeforeDiscounts: 24000,
					introductoryInterval: 1,
					introductoryTerm: 'year',
					variantLabel: { noun: 'Year', adjective: 'Annual' },
				} ),
				makeVariant( {
					productBillingTermInMonths: 24,
					termIntervalInMonths: 24,
					productId: 1010,
					priceInteger: 20000,
					priceBeforeDiscounts: 48000,
					introductoryInterval: 2,
					introductoryTerm: 'year',
					variantLabel: { noun: 'Two years', adjective: 'Two-year' },
				} ),
			] );
			render( <CheckoutSidebarPlanUpsell /> );
			expect( screen.getByText( '$100' ) ).toBeVisible();
			expect( screen.queryByText( '$99.96' ) ).not.toBeInTheDocument();
		} );
	} );
} );
