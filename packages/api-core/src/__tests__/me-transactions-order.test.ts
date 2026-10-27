import nock from 'nock';
import { fetchTransactionOrder } from '../me-transactions-order';

const BASE = 'https://public-api.wordpress.com';

describe( 'fetchTransactionOrder', () => {
	afterEach( () => nock.cleanAll() );

	test( 'fetches an order from v1.1', async () => {
		const order = {
			order_id: 1234,
			user_id: 5678,
			receipt_id: 91011,
			processing_status: 'success',
		};
		const scope = nock( BASE ).get( '/rest/v1.1/me/transactions/order/1234' ).reply( 200, order );

		await expect( fetchTransactionOrder( 1234 ) ).resolves.toEqual( order );
		expect( scope.isDone() ).toBe( true );
	} );
} );
