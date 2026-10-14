/**
 * @jest-environment jsdom
 */
import wpcom from 'calypso/lib/wp';
import {
	fetchPressableReturn,
	getOriginalReturnUrl,
	getReturnRequest,
	isPressableReturnUrl,
	storeOriginalReturnUrl,
} from '../lib';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { post: jest.fn() } },
} ) );

const post = wpcom.req.post as jest.Mock;
const originalUrl =
	'https://my.pressable.com/titan_email/checkout_return?agency_id=42&quantity=2&signature=original';
const signedUrl = `${ originalUrl }&checkout_status=SUCCESS&timestamp=123`;

beforeEach( () => {
	post.mockReset();
	window.sessionStorage.clear();
} );

describe( 'Pressable return context', () => {
	it.each( [ 'standard', 'premium' ] )( 'recognizes a prepared %s Titan cart', ( plan ) => {
		expect(
			getOriginalReturnUrl(
				[
					{
						extra: {
							isA4ASitelessCheckout: true,
							agency_id: 42,
							titan_domain: 'example.com',
							titan_plan: plan,
							afterPurchaseUrl: originalUrl,
						},
					},
				],
				42
			)
		).toBe( originalUrl );
	} );

	it( 'does not recognize an arbitrary product with afterPurchaseUrl', () => {
		expect( getOriginalReturnUrl( [ { extra: { afterPurchaseUrl: originalUrl } } ], 42 ) ).toBe(
			undefined
		);
	} );

	it( 'keeps cancellation context isolated by agency and preserves the original quantity', () => {
		storeOriginalReturnUrl( 42, originalUrl );
		expect( getReturnRequest( { agencyId: '42', canceled: '1' } ) ).toEqual( {
			agency_id: 42,
			checkout_status: 'CANCELED',
			afterPurchaseUrl: originalUrl,
		} );
		expect( () => getReturnRequest( { agencyId: '43', canceled: '1' } ) ).toThrow();
	} );

	it.each( [
		{},
		{ agencyId: '42', receiptId: ':receiptId' },
		{ agencyId: '42', receiptId: '1', orderId: '2' },
		{ agencyId: '42', receiptId: '0' },
		{ agencyId: '42', receiptId: '1e2' },
		{ agencyId: '42', receiptId: '9007199254740992' },
		{ agencyId: '42', canceled: '2' },
		{ agencyId: '42', canceled: '1', receiptId: '1' },
		{ agencyId: '42', canceled: '1' },
	] )( 'rejects missing or ambiguous context %p', ( params ) => {
		expect( () => getReturnRequest( params ) ).toThrow();
	} );
} );

describe( 'Pressable return request', () => {
	it( 'sends the receipt only to the authenticated internal action and follows its URL unchanged', async () => {
		post.mockResolvedValue( { afterPurchaseUrl: signedUrl } );
		await expect( fetchPressableReturn( { agencyId: '42', receiptId: '99' } ) ).resolves.toBe(
			signedUrl
		);
		expect( post ).toHaveBeenCalledWith( {
			apiNamespace: 'wpcom/v2',
			path: '/agency/pressable/titan-checkout-return',
			method: 'POST',
			body: { agency_id: 42, checkout_status: 'SUCCESS', receipt_id: 99 },
		} );
	} );

	it( 'supports an existing order ID without trusting it as proof of success', async () => {
		post.mockRejectedValue( new Error( 'Purchase is still pending.' ) );
		await expect( fetchPressableReturn( { agencyId: '42', orderId: '99' } ) ).rejects.toThrow();
		expect( post.mock.calls[ 0 ][ 0 ].body ).toEqual( {
			agency_id: 42,
			checkout_status: 'SUCCESS',
			order_id: 99,
		} );
	} );

	it( 'sends only the preserved original URL for authenticated cancellation', async () => {
		storeOriginalReturnUrl( 42, originalUrl );
		post.mockResolvedValue( { afterPurchaseUrl: signedUrl } );
		await fetchPressableReturn( { agencyId: '42', canceled: '1' } );
		expect( post.mock.calls[ 0 ][ 0 ].body ).toEqual( {
			agency_id: 42,
			checkout_status: 'CANCELED',
			afterPurchaseUrl: originalUrl,
		} );
	} );

	it( 'fetches a fresh URL each time rather than reusing a signed response', async () => {
		post
			.mockResolvedValueOnce( { afterPurchaseUrl: signedUrl } )
			.mockResolvedValueOnce( { afterPurchaseUrl: `${ signedUrl }4` } );
		const params = { agencyId: '42', receiptId: '99' };
		expect( await fetchPressableReturn( params ) ).toBe( signedUrl );
		expect( await fetchPressableReturn( params ) ).toBe( `${ signedUrl }4` );
		expect( post ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'does not request a signing action when cancellation context is missing', async () => {
		await expect( fetchPressableReturn( { agencyId: '42', canceled: '1' } ) ).rejects.toThrow();
		expect( post ).not.toHaveBeenCalled();
	} );

	it.each( [
		undefined,
		'http://my.pressable.com/titan_email/checkout_return',
		'https://my.pressable.com.evil.test/titan_email/checkout_return',
		'https://my.pressable.com:444/titan_email/checkout_return',
		'https://my.pressable.com/other',
		'https://buyer@my.pressable.com/titan_email/checkout_return',
		'https://my.pressable.com/titan_email/checkout_return#fragment',
		'/titan_email/checkout_return',
	] )( 'rejects a missing or unsafe backend destination %p', async ( afterPurchaseUrl ) => {
		expect( isPressableReturnUrl( afterPurchaseUrl ) ).toBe( false );
		post.mockResolvedValue( { afterPurchaseUrl } );
		await expect( fetchPressableReturn( { agencyId: '42', receiptId: '99' } ) ).rejects.toThrow();
	} );
} );
