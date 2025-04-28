// @ts-nocheck - TODO: Fix TypeScript issues
import { SITE_INTRO_OFFER_RECEIVE } from 'calypso/state/action-types';
import { items, IntroOfferReceiveAction } from '../reducer';

describe( 'reducer', () => {
	describe( '#introOffers()', () => {
		describe( 'items', () => {
			test( 'should return an empty state when original state is undefined and action is empty', () => {
				const state = items( undefined, { type: undefined } );

				expect( state ).toEqual( {} );
			} );

			test( 'should return the transformed introductory offer with no siteId', () => {
				const state = items( undefined, {
					type: SITE_INTRO_OFFER_RECEIVE,
					siteId: 'none',
					payload: [
						{
							product_id: 2010,
							product_slug: 'jetpack_security_daily',
							currency_code: 'USD',
							formatted_price: '$149',
							raw_price: 149,
							ineligible_reason: null,
							discount_percentage: 50,
						},
					],
				} as IntroOfferReceiveAction );

				expect( state ).toEqual( {
					none: {
						2010: {
							productId: 2010,
							productSlug: 'jetpack_security_daily',
							currencyCode: 'USD',
							formattedPrice: '$149',
							rawPrice: 149,
							ineligibleReason: null,
							discountPercentage: 50,
						},
					},
				} );
			} );

			test( 'should return the transformed introductory offer with siteId', () => {
				const state = items( undefined, {
					type: SITE_INTRO_OFFER_RECEIVE,
					siteId: 12345,
					payload: [
						{
							product_id: 2010,
							product_slug: 'jetpack_security_daily',
							currency_code: 'USD',
							formatted_price: '$149',
							raw_price: 149,
							ineligible_reason: null,
							discount_percentage: 50,
						},
					],
				} as IntroOfferReceiveAction );

				expect( state ).toEqual( {
					12345: {
						2010: {
							productId: 2010,
							productSlug: 'jetpack_security_daily',
							currencyCode: 'USD',
							formattedPrice: '$149',
							rawPrice: 149,
							ineligibleReason: null,
							discountPercentage: 50,
						},
					},
				} );
			} );
		} );
	} );
} );
