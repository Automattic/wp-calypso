import { type ResponseCartProduct, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { isValidWooExpressUpsell } from '../is-wooexpress-upgrade';

describe( 'isValidWooExpressUpsell', () => {
	test( 'should return true if the product is a Woo Express plan', () => {
		const product: ResponseCartProduct = {
			...getEmptyResponseCartProduct(),
			product_slug: 'wooexpress-medium-bundle-yearly',
		};

		expect( isValidWooExpressUpsell( product ) ).toBe( true );
	} );
	test( 'should return false if the product is not a Woo Express plan', () => {
		const product: ResponseCartProduct = {
			...getEmptyResponseCartProduct(),
			product_slug: 'business-bundle',
		};

		expect( isValidWooExpressUpsell( product ) ).toBe( false );
	} );
} );
