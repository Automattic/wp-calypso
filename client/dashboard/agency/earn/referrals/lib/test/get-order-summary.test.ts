import { getOrderSummary } from '../get-order-summary';
import type { ReferralApiResponse, ReferralPurchase } from '@automattic/api-core';

const purchase = ( productName: string ) =>
	( { product_id: 1, subscription: { product_name: productName } } ) as ReferralPurchase;

describe( 'getOrderSummary', () => {
	test( 'folds the licenses of one product into its name with their count', () => {
		const order = {
			products: [ 'Jetpack Complete', 'Akismet', 'Jetpack Complete', 'Backup', 'Scan' ].map(
				purchase
			),
		} as ReferralApiResponse;

		expect( getOrderSummary( order ) ).toBe( 'Jetpack Complete x 2, Akismet, Backup, and 1 more' );
	} );
} );
