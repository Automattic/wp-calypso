/** @format */

/**
 * Internal dependencies
 */
import { isFetchingOrderTransaction } from 'state/selectors';

describe( 'isFetchingOrderTransaction', () => {
	const orderId = 123;

	test( 'should be defaulted to false.', () => {
		expect( isFetchingOrderTransaction( {}, orderId ) ).toEqual( false );
	} );

	test( 'should return the stored true.', () => {
		expect(
			isFetchingOrderTransaction(
				{
					orderTransactions: {
						isFetching: {
							[ orderId ]: true,
						},
					},
				},
				orderId
			)
		).toEqual( true );
	} );
} );
