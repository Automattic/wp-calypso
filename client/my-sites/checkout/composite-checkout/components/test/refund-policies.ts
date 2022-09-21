import {
	PLAN_MONTHLY_PERIOD,
	PLAN_PERSONAL,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	TITAN_MAIL_YEARLY_SLUG,
	WPCOM_DIFM_LITE,
} from '@automattic/calypso-products';
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { getRefundPolicies, RefundPolicy } from '../refund-policies';

function getCart( productSlugs: string[] = [], cost = 10 ) {
	const cart = getEmptyResponseCart();

	cart.products = productSlugs.map( ( productSlug ) => {
		const product = getEmptyResponseCartProduct();

		product.item_subtotal_integer = cost;
		product.item_subtotal_display = `$${ cost }`;
		product.product_slug = productSlug;

		if ( productSlug.endsWith( '_domain' ) ) {
			product.meta = 'test.live';
			product.is_domain_registration = true;
		}

		return product;
	} );

	return cart;
}

describe( 'getRefundPolicies', () => {
	test( 'add-on product', () => {
		const cart = getCart( [ PRODUCT_WPCOM_CUSTOM_DESIGN ] );
		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [ RefundPolicy.AddOnYearly ] );
	} );

	test( 'domain registration', () => {
		const cart = getCart( [ 'dotlive_domain' ] );
		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [ RefundPolicy.DomainNameRegistration ] );
	} );

	test( 'free domain registration', () => {
		const cart = getCart( [ 'dotlive_domain' ], 0 );
		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [] );
	} );

	test( 'domain registration and plan', () => {
		const cart = getCart( [ 'dotlive_domain', PLAN_PERSONAL ] );
		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [
			RefundPolicy.DomainNameRegistrationForPlan,
			RefundPolicy.PlanYearly,
		] );
	} );

	test( 'domain registration, plan and professional email', () => {
		const cart = getCart( [ 'dotlive_domain', PLAN_PERSONAL ] );

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

		expect( refundPolicies ).toEqual( [
			RefundPolicy.DomainNameRegistrationForPlan,
			RefundPolicy.PlanYearly,
			RefundPolicy.ProfessionalEmailFreeTrialYearly,
		] );
	} );

	test( 'Jetpack Scan monthly product', () => {
		const cart = getCart();
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
		const cart = getCart();
		cart.products.push( {
			...getEmptyResponseCartProduct(),
			bill_period: '-1',
			item_subtotal_integer: 500,
			product_slug: WPCOM_DIFM_LITE,
		} );

		const refundPolicies = getRefundPolicies( cart );

		expect( refundPolicies ).toEqual( [] );
	} );
} );
