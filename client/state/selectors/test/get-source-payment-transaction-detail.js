/** @format */

/**
 * Internal dependencies
 */
import { getSourcePaymentTransactionDetail } from 'state/selectors';

describe( 'getSourcePaymentTransactionDetail()', () => {
	test( 'should default to null', () => {
		expect( getSourcePaymentTransactionDetail( {}, 123 ) ).toBeNull();
	} );

	test( 'should return the expected stored value.', () => {
		const orderId = 123;
		const detail = {
			status: 'I am stored!',
		};
		expect(
			getSourcePaymentTransactionDetail(
				{
					transactions: {
						sourcePayment: {
							[ orderId ]: detail,
						},
					},
				},
				orderId
			)
		).toEqual( detail );
	} );
} );
