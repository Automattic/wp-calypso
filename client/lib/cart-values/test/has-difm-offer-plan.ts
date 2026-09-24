import {
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_PREMIUM,
	WPCOM_DIFM_LITE,
} from '@automattic/calypso-products';
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { hasDIFMOfferPlan } from '../cart-items';
import type { ResponseCart, ResponseCartProductExtra } from '@automattic/shopping-cart';

function cartWith( product_slug: string, extra: ResponseCartProductExtra = {} ): ResponseCart {
	const cart = getEmptyResponseCart();
	cart.products.push( { ...getEmptyResponseCartProduct(), product_slug, extra } );
	return cart;
}

describe( 'hasDIFMOfferPlan()', () => {
	test( 'returns true for a Business plan flagged with difm_offer', () => {
		expect( hasDIFMOfferPlan( cartWith( PLAN_BUSINESS, { difm_offer: true } ) ) ).toBe( true );
	} );

	test( 'returns true for a flagged Business plan of any billing term', () => {
		expect( hasDIFMOfferPlan( cartWith( PLAN_BUSINESS_MONTHLY, { difm_offer: true } ) ) ).toBe(
			true
		);
	} );

	test( 'returns false for an unflagged Business plan', () => {
		expect( hasDIFMOfferPlan( cartWith( PLAN_BUSINESS ) ) ).toBe( false );
		expect( hasDIFMOfferPlan( cartWith( PLAN_BUSINESS, { difm_offer: false } ) ) ).toBe( false );
	} );

	test( 'returns false for a Business plan whose difm_offer is not exactly true', () => {
		const extra = { difm_offer: 'yes' } as unknown as ResponseCartProductExtra;
		expect( hasDIFMOfferPlan( cartWith( PLAN_BUSINESS, extra ) ) ).toBe( false );
	} );

	test( 'returns false for a flagged product that is not a Business plan', () => {
		expect( hasDIFMOfferPlan( cartWith( PLAN_PREMIUM, { difm_offer: true } ) ) ).toBe( false );
		expect( hasDIFMOfferPlan( cartWith( WPCOM_DIFM_LITE, { difm_offer: true } ) ) ).toBe( false );
	} );

	test( 'returns false for an empty cart', () => {
		expect( hasDIFMOfferPlan( getEmptyResponseCart() ) ).toBe( false );
	} );
} );
