import { filterSortAndPaginate } from '@wordpress/dataviews';
import { DEFAULT_VIEW, getFields } from '../dataviews';
import type { Purchase } from '@automattic/api-core';

const createPurchase = ( ID: number, overrides: Partial< Purchase > = {} ): Purchase =>
	( {
		ID,
		is_past_first_auto_renew_attempt_date: false,
		might_still_auto_renew: true,
		...overrides,
	} ) as Purchase;

describe( 'getFields', () => {
	test( 'filters to purchases whose failed renewal payment will be retried', () => {
		const purchases = [
			createPurchase( 1 ),
			createPurchase( 2, { is_past_first_auto_renew_attempt_date: true } ),
			createPurchase( 3, {
				is_past_first_auto_renew_attempt_date: true,
				might_still_auto_renew: false,
			} ),
		];
		const fields = getFields( { sites: [], paymentMethods: [], transferredPurchases: [] } );

		const { data } = filterSortAndPaginate(
			purchases,
			{
				...DEFAULT_VIEW,
				filters: [ { field: 'renewalPayment', operator: 'is', value: 'failed' } ],
			},
			fields
		);

		expect( data.map( ( purchase ) => purchase.ID ) ).toEqual( [ 2 ] );
	} );
} );
