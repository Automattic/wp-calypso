import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_WOOEXPRESS_MEDIUM,
} from '@automattic/calypso-products';
import { isValidWooExpressUpsell, isWooExpressUpgrade } from '../is-wooexpress-upgrade';
import type { Receipt, ReceiptItem } from '@automattic/api-core';

const makeItem = ( overrides: Partial< ReceiptItem > ): ReceiptItem =>
	( {
		wpcom_product_slug: PLAN_BUSINESS,
		previous_plan_slug: null,
		...overrides,
	} ) as ReceiptItem;

const makeReceipt = ( items: ReceiptItem[] ): Receipt => ( { items } ) as Receipt;

describe( 'isValidWooExpressUpsell', () => {
	test( 'should return true if the item is a Woo Express plan', () => {
		expect(
			isValidWooExpressUpsell( makeItem( { wpcom_product_slug: PLAN_WOOEXPRESS_MEDIUM } ) )
		).toBe( true );
	} );
	test( 'should return false if the item is not a Woo Express plan', () => {
		expect( isValidWooExpressUpsell( makeItem( { wpcom_product_slug: PLAN_BUSINESS } ) ) ).toBe(
			false
		);
	} );
} );

describe( 'isWooExpressUpgrade', () => {
	test( 'should return true for a Woo Express plan bought on a Woo Express trial site', () => {
		const receipt = makeReceipt( [
			makeItem( {
				wpcom_product_slug: PLAN_WOOEXPRESS_MEDIUM,
				previous_plan_slug: PLAN_ECOMMERCE_TRIAL_MONTHLY,
			} ),
		] );
		expect( isWooExpressUpgrade( receipt ) ).toBe( true );
	} );
	test( 'should return false for a Woo Express plan bought on a site without a trial', () => {
		const receipt = makeReceipt( [
			makeItem( { wpcom_product_slug: PLAN_WOOEXPRESS_MEDIUM, previous_plan_slug: null } ),
		] );
		expect( isWooExpressUpgrade( receipt ) ).toBe( false );
	} );
	test( 'should return false for a non-ecommerce plan bought on a Woo Express trial site', () => {
		const receipt = makeReceipt( [
			makeItem( {
				wpcom_product_slug: PLAN_BUSINESS,
				previous_plan_slug: PLAN_ECOMMERCE_TRIAL_MONTHLY,
			} ),
		] );
		expect( isWooExpressUpgrade( receipt ) ).toBe( false );
	} );
} );
