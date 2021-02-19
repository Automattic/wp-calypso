/**
 * Internal dependencies
 */
import isFetchingOrderTransaction from 'calypso/state/selectors/is-fetching-order-transaction';

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
