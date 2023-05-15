import { PLAN_BUSINESS, PLAN_WOOEXPRESS_MEDIUM } from '@automattic/calypso-products';
import { type ResponseCartProduct, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { isValidWooExpressUpsell } from '../is-wooexpress-upgrade';

describe( 'isValidWooExpressUpsell', () => {
	test( 'should return true if the product is a Woo Express plan', () => {
		const product: ResponseCartProduct = {
			...getEmptyResponseCartProduct(),
			product_slug: PLAN_WOOEXPRESS_MEDIUM,
		};

		expect( isValidWooExpressUpsell( product ) ).toBe( true );
	} );
	test( 'should return false if the product is not a Woo Express plan', () => {
		const product: ResponseCartProduct = {
			...getEmptyResponseCartProduct(),
			product_slug: PLAN_BUSINESS,
		};

		expect( isValidWooExpressUpsell( product ) ).toBe( false );
	} );
} );
