import { PURCHASE_CANCELLATION_OFFER_RECEIVE } from 'calypso/state/action-types';
import { offers } from '../reducer';
import type { AnyAction } from 'redux';

describe( 'reducer', () => {
	describe( '#cancellationOffers()', () => {
		describe( 'offers', () => {
			test( 'Should transform the API response to match typed object definition', () => {
				const state = offers( undefined, {
					type: PURCHASE_CANCELLATION_OFFER_RECEIVE,
					offers: [
						{
							currency_code: 'USD',
							discount_percentage: 20,
							discounted_periods: 1,
							formatted_price: '$99.95',
							offer_code: 'CODE',
						},
					],
				} as AnyAction );

				expect( state ).toEqual( [
					{
						currencyCode: 'USD',
						discountPercentage: 20,
						discountedPeriods: 1,
						formattedPrice: '$99.95',
						offerCode: 'CODE',
					},
				] );
			} );
		} );
	} );
} );
