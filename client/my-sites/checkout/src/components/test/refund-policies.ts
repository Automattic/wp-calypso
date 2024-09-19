import {
	PLAN_BIENNIAL_PERIOD,
	PLAN_MONTHLY_PERIOD,
	PLAN_PERSONAL,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_3_YEARS,
	PLAN_PREMIUM_MONTHLY,
	PLAN_TRIENNIAL_PERIOD,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	TITAN_MAIL_YEARLY_SLUG,
	WPCOM_DIFM_LITE,
} from '@automattic/calypso-products';
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { getRefundPolicies, getRefundWindows, RefundPolicy } from '../refund-policies';

function getPlanAndDomainBundle( planSlug: string ) {
	const cart = getEmptyResponseCart();

	cart.bundled_domain = 'test.live';

	cart.products.push( {
		...getEmptyResponseCartProduct(),
		is_bundled: true,
		is_domain_registration: true,
		meta: 'test.live',
		product_slug: 'dotlive_domain',
	} );

	cart.products.push( {
		...getEmptyResponseCartProduct(),
		extra: { domain_to_bundle: 'test.live' },
		item_subtotal_integer: 10,
		product_slug: planSlug,
	} );

	return cart;
}

describe( 'getRefundPolicies', () => {
	test( 'domain gift', () => {
		const cart = getEmptyResponseCart();
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			item_subtotal_integer: 10,
			is_domain_registration: true,
			meta: 'test.live',
			product_slug: 'dotlive_domain',
		} );

		cart.is_gift_purchase = true;

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [ RefundPolicy.GiftDomainPurchase ] );
	} );

	test( 'biennial gift', () => {
		const cart = getEmptyResponseCart();
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			item_subtotal_integer: 5,
			product_slug: PLAN_PREMIUM_2_YEARS,
			bill_period: String( PLAN_BIENNIAL_PERIOD ),
		} );

		cart.is_gift_purchase = true;

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [ RefundPolicy.GiftBiennialPurchase ] );
	} );

	test( 'annual gift', () => {
		const cart = getEmptyResponseCart();
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			item_subtotal_integer: 5,
			product_slug: PLAN_PREMIUM,
		} );

		cart.is_gift_purchase = true;

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [ RefundPolicy.GiftYearlyPurchase ] );
	} );

	test( 'monthly gift', () => {
		const cart = getEmptyResponseCart();
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			item_subtotal_integer: 5,
			product_slug: PLAN_PREMIUM_MONTHLY,
			bill_period: String( PLAN_MONTHLY_PERIOD ),
		} );

		cart.is_gift_purchase = true;

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [ RefundPolicy.GiftMonthlyPurchase ] );
	} );

	test( 'add-on product', () => {
		const cart = getEmptyResponseCart();
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			item_subtotal_integer: 5,
			product_slug: PRODUCT_WPCOM_CUSTOM_DESIGN,
		} );

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [ RefundPolicy.GenericYearly ] );
	} );

	test( 'paid domain', () => {
		const cart = getEmptyResponseCart();
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			item_subtotal_integer: 10,
			is_domain_registration: true,
			meta: 'test.live',
			product_slug: 'dotlive_domain',
		} );

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [ RefundPolicy.DomainNameRegistration ] );
	} );

	test( 'transfer domain', () => {
		const cart = getEmptyResponseCart();
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			item_subtotal_integer: 10,
			is_domain_registration: false,
			meta: 'test.live',
			product_slug: 'domain_transfer',
		} );

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [ RefundPolicy.DomainNameTransfer ] );
	} );

	test( 'free domain', () => {
		const cart = getEmptyResponseCart();
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			is_domain_registration: true,
			meta: 'test.live',
			product_slug: 'dotlive_domain',
		} );

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [] );
	} );

	test( 'monthly plan', () => {
		const cart = getEmptyResponseCart();
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			bill_period: `${ PLAN_MONTHLY_PERIOD }`,
			item_subtotal_integer: 10,
			product_slug: PLAN_PREMIUM_MONTHLY,
		} );

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [ RefundPolicy.GenericMonthly ] );
	} );

	test( 'biennial plan', () => {
		const cart = getEmptyResponseCart();
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			bill_period: `${ PLAN_BIENNIAL_PERIOD }`,
			item_subtotal_integer: 35,
			product_slug: PLAN_PREMIUM_2_YEARS,
		} );

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [ RefundPolicy.GenericBiennial ] );
	} );

	test( 'triennial plan', () => {
		const cart = getEmptyResponseCart();
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			bill_period: `${ PLAN_TRIENNIAL_PERIOD }`,
			item_subtotal_integer: 70,
			product_slug: PLAN_PREMIUM_3_YEARS,
		} );

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [ RefundPolicy.GenericTriennial ] );
	} );

	test( 'yearly plan and bundled domain', () => {
		const cart = getPlanAndDomainBundle( PLAN_PERSONAL );

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [ RefundPolicy.PlanYearlyBundle ] );
	} );

	test( 'yearly plan, bundled domain and paid domain', () => {
		const cart = getPlanAndDomainBundle( PLAN_PERSONAL );

		// Paid domain
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			item_subtotal_integer: 10,
			is_domain_registration: true,
			meta: 'test2.live',
			product_slug: 'dotlive_domain',
		} );

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [
			RefundPolicy.PlanYearlyBundle,
			RefundPolicy.DomainNameRegistration,
		] );
	} );

	test( 'yearly plan, bundled domain and professional email free trial', () => {
		const cart = getPlanAndDomainBundle( PLAN_PERSONAL );

		cart.products.push( {
			...getEmptyResponseCartProduct(),
			product_slug: TITAN_MAIL_YEARLY_SLUG,
			introductory_offer_terms: {
				enabled: true,
				interval_count: 3,
				interval_unit: 'month',
				should_prorate_when_offer_ends: true,
				transition_after_renewal_count: 0,
			},
		} );

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [ RefundPolicy.PlanYearlyBundle ] );
	} );

	test( 'monthly plan and bundled paid domain', () => {
		const cart = getEmptyResponseCart();

		cart.products.push( {
			...getEmptyResponseCartProduct(),
			is_domain_registration: true,
			item_subtotal_integer: 10,
			meta: 'test.live',
			product_slug: 'dotlive_domain',
		} );

		cart.products.push( {
			...getEmptyResponseCartProduct(),
			bill_period: `${ PLAN_MONTHLY_PERIOD }`,
			extra: { domain_to_bundle: 'test.live' },
			item_subtotal_integer: 10,
			product_slug: PLAN_PREMIUM_MONTHLY,
		} );

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [
			RefundPolicy.DomainNameRegistration,
			RefundPolicy.PlanMonthlyBundle,
		] );
	} );

	test( 'monthly plan renewal and domain renewal', () => {
		const cart = getEmptyResponseCart();

		cart.products.push( {
			...getEmptyResponseCartProduct(),
			bill_period: `${ PLAN_MONTHLY_PERIOD }`,
			extra: { purchaseType: 'renewal' },
			item_subtotal_integer: 10,
			product_slug: PLAN_PREMIUM_MONTHLY,
		} );

		cart.products.push( {
			...getEmptyResponseCartProduct(),
			extra: { purchaseType: 'renewal' },
			is_domain_registration: true,
			item_subtotal_integer: 10,
			meta: 'test.live',
			product_slug: 'dotlive_domain',
		} );

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [
			RefundPolicy.PlanMonthlyRenewal,
			RefundPolicy.DomainNameRenewal,
		] );
	} );

	test( 'Jetpack Scan monthly product', () => {
		const cart = getEmptyResponseCart();
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			bill_period: `${ PLAN_MONTHLY_PERIOD }`,
			item_subtotal_integer: 10,
			product_slug: PRODUCT_JETPACK_SCAN_MONTHLY,
		} );

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [ RefundPolicy.GenericMonthly ] );
	} );

	test( 'DIFM product', () => {
		const cart = getEmptyResponseCart();
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			bill_period: '-1',
			item_subtotal_integer: 500,
			product_slug: WPCOM_DIFM_LITE,
		} );

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [ RefundPolicy.NonRefundable ] );
	} );

	test( 'premium theme product', () => {
		const cart = getEmptyResponseCart();
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			bill_period: '-1',
			item_subtotal_integer: 50,
			product_slug: 'premium_theme',
		} );

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [ RefundPolicy.PremiumTheme ] );
	} );

	test( 'bundled domain and paid domain', () => {
		const cart = getEmptyResponseCart();

		cart.bundled_domain = 'test.live';

		cart.products.push( {
			...getEmptyResponseCartProduct(),
			is_bundled: true,
			is_domain_registration: true,
			meta: 'test.live',
			product_slug: 'dotlive_domain',
		} );

		cart.products.push( {
			...getEmptyResponseCartProduct(),
			is_domain_registration: true,
			item_subtotal_integer: 10,
			meta: 'test2.live',
			product_slug: 'dotlive_domain',
		} );

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [
			RefundPolicy.DomainNameRegistration,
			RefundPolicy.DomainNameRegistrationBundled,
		] );
	} );
} );

describe( 'getRefundWindows', () => {
	test( 'paid domain', () => {
		const refundWindows = getRefundWindows( [ RefundPolicy.DomainNameRegistration ] );

		expect( refundWindows ).toEqual( [ 4 ] );
	} );

	test( 'monthly product', () => {
		const refundWindows = getRefundWindows( [ RefundPolicy.GenericMonthly ] );

		expect( refundWindows ).toEqual( [ 7 ] );
	} );

	test( 'yearly and biennial product', () => {
		const refundWindows = getRefundWindows( [
			RefundPolicy.GenericYearly,
			RefundPolicy.GenericBiennial,
		] );

		expect( refundWindows ).toEqual( [ 14 ] );
	} );

	test( 'yearly plan and bundled domain', () => {
		const refundWindows = getRefundWindows( [ RefundPolicy.PlanYearlyBundle ] );

		expect( refundWindows ).toEqual( [ 14 ] );
	} );

	test( 'premium theme', () => {
		const refundWindows = getRefundWindows( [ RefundPolicy.PremiumTheme ] );

		expect( refundWindows ).toEqual( [ 14 ] );
	} );

	test( 'non-refundable', () => {
		const refundWindows = getRefundWindows( [ RefundPolicy.NonRefundable ] );

		expect( refundWindows ).toEqual( [] );
	} );
} );
