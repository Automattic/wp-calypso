/**
 * Internal dependencies
 */
import getOrderTransactionError from 'calypso/state/selectors/get-order-transaction-error';

describe( 'getOrderTransactionError()', () => {
	const orderId = 123;

	test( 'should default to null', () => {
		expect( getOrderTransactionError( {}, orderId ) ).toBeNull();
	} );

	test( 'should return the expected stored error.', () => {
		const error = {
			message: 'error handling and profit!',
		};

		expect(
			getOrderTransactionError(
				{
					orderTransactions: {
						errors: {
							[ orderId ]: error,
						},
					},
				},
				orderId
			)
		).toEqual( error );
	} );
} );
