<<<<<<< HEAD
import { PLAN_BUSINESS, PLAN_WOOEXPRESS_MEDIUM } from '@automattic/calypso-products';
=======
>>>>>>> 3ac2bf0cf1 (Add tests for the isValidWooExpressUpsell function)
import { type ResponseCartProduct, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { isValidWooExpressUpsell } from '../is-wooexpress-upgrade';

describe( 'isValidWooExpressUpsell', () => {
	test( 'should return true if the product is a Woo Express plan', () => {
		const product: ResponseCartProduct = {
			...getEmptyResponseCartProduct(),
<<<<<<< HEAD
			product_slug: PLAN_WOOEXPRESS_MEDIUM,
=======
			product_slug: 'wooexpress-medium-bundle-yearly',
>>>>>>> 3ac2bf0cf1 (Add tests for the isValidWooExpressUpsell function)
		};

		expect( isValidWooExpressUpsell( product ) ).toBe( true );
	} );
	test( 'should return false if the product is not a Woo Express plan', () => {
		const product: ResponseCartProduct = {
			...getEmptyResponseCartProduct(),
<<<<<<< HEAD
			product_slug: PLAN_BUSINESS,
=======
			product_slug: 'business-bundle',
>>>>>>> 3ac2bf0cf1 (Add tests for the isValidWooExpressUpsell function)
		};

		expect( isValidWooExpressUpsell( product ) ).toBe( false );
	} );
} );
