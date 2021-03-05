/**
 * Internal dependencies
 */
import getOrderTransaction from 'calypso/state/selectors/get-order-transaction';

describe( 'getOrderTransaction()', () => {
	test( 'should default to null', () => {
		expect( getOrderTransaction( {}, 123 ) ).toBeNull();
	} );

	test( 'should return the expected stored value.', () => {
		const orderId = 123;
		const transaction = {
			status: 'I am stored!',
		};
		expect(
			getOrderTransaction(
				{
					orderTransactions: {
						items: {
							[ orderId ]: transaction,
						},
					},
				},
				orderId
			)
		).toEqual( transaction );
	} );
} );
