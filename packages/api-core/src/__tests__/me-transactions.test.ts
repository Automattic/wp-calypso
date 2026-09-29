import nock from 'nock';
import { confirmPayPalPPCPPayment, createPayPalExpressUrl } from '../me-paypal-payments';
import { createTransaction } from '../me-transactions';
import { tokenizeEbanxCardWithVgs } from '../transact-vgs';
import { createUser } from '../users';

const BASE = 'https://public-api.wordpress.com';

describe( 'transaction submission', () => {
	afterEach( () => nock.cleanAll() );

	test( 'posts a transaction to v1.1', async () => {
		let body: Record< string, unknown > | undefined;
		nock( BASE )
			.post( '/rest/v1.1/me/transactions', ( requestBody ) => {
				body = requestBody;
				return true;
			} )
			.reply( 200, { success: true, receipt_id: 1234, order_id: 5678 } );

		const result = await createTransaction( { cart: { blog_id: 1 }, payment: { name: 'Ada' } } );

		expect( body ).toEqual( { cart: { blog_id: 1 }, payment: { name: 'Ada' } } );
		expect( result ).toEqual( { success: true, receipt_id: 1234, order_id: 5678 } );
	} );

	test( 'requests a PayPal Express URL from v1.2', async () => {
		let body: Record< string, unknown > | undefined;
		nock( BASE )
			.post( '/rest/v1.2/me/paypal-express-url', ( requestBody ) => {
				body = requestBody;
				return true;
			} )
			.reply( 200, { redirect_url: 'https://paypal.example/redirect' } );

		const result = await createPayPalExpressUrl( { success_url: 'https://example.com' } );

		expect( body ).toEqual( { success_url: 'https://example.com' } );
		expect( result ).toEqual( { redirect_url: 'https://paypal.example/redirect' } );
	} );

	test( 'confirms a PayPal PPCP payment', async () => {
		let body: Record< string, unknown > | undefined;
		nock( BASE )
			.post( '/rest/v1.1/me/paypal-ppcp-confirm-payment', ( requestBody ) => {
				body = requestBody;
				return true;
			} )
			.reply( 200, { success: true } );

		const result = await confirmPayPalPPCPPayment( { orderId: '1234', payPalOrderId: 'PP-1' } );

		expect( body ).toEqual( { bd_order_id: '1234', paypal_order_id: 'PP-1' } );
		expect( result ).toEqual( { success: true } );
	} );

	test( 'tokenizes an EBANX card through wpcom/v2', async () => {
		const request = {
			card_number: 'tok_number',
			card_name: 'Ada Lovelace',
			card_due_date: 'tok_exp',
			card_cvv: 'tok_cvc',
			payment_type_code: 'new_purchase',
			country: 'BR',
		};
		let body: Record< string, unknown > | undefined;
		nock( BASE )
			.post( '/wpcom/v2/transact/vgs/wpcom/ebanx/tokenize', ( requestBody ) => {
				body = requestBody;
				return true;
			} )
			.reply( 200, { token: 'ebanx-token', payment_type_code: 'visa' } );

		const result = await tokenizeEbanxCardWithVgs( request );

		expect( body ).toEqual( request );
		expect( result ).toEqual( { token: 'ebanx-token', payment_type_code: 'visa' } );
	} );

	test( 'creates a user', async () => {
		let body: Record< string, unknown > | undefined;
		nock( BASE )
			.post( '/rest/v1.1/users/new', ( requestBody ) => {
				body = requestBody;
				return true;
			} )
			.reply( 200, { success: true, username: 'ada' } );

		const result = await createUser( { email: 'ada@example.com', is_passwordless: true } );

		expect( body ).toEqual( { email: 'ada@example.com', is_passwordless: true } );
		expect( result ).toEqual( { success: true, username: 'ada' } );
	} );
} );
