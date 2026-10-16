/**
 * @jest-environment jsdom
 */
import wpcom from 'calypso/lib/wp';
import { fetchCanceledPressableReturn, fetchPressableReturn } from '../lib';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { post: jest.fn() } },
} ) );

const post = wpcom.req.post as jest.Mock;
const returnUrl = 'https://my.pressable.com/titan_email/checkout_return';

beforeEach( () => {
	post.mockReset();
} );

it( 'requests SUCCESS using the receipt and returns the signed URL unchanged', async () => {
	const signedUrl = `${ returnUrl }?checkout_status=SUCCESS&timestamp=123&signature=fresh`;
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

it( 'requests CANCELED using the original cart URL and returns the fresh URL unchanged', async () => {
	const originalUrl = `${ returnUrl }?agency_id=42&quantity=2&signature=original`;
	const signedUrl = `${ returnUrl }?agency_id=42&quantity=2&checkout_status=CANCELED&signature=fresh`;
	post.mockResolvedValue( { afterPurchaseUrl: signedUrl } );

	await expect(
		fetchCanceledPressableReturn( { agencyId: 42, afterPurchaseUrl: originalUrl } )
	).resolves.toBe( signedUrl );
	expect( post.mock.calls[ 0 ][ 0 ].body ).toEqual( {
		agency_id: 42,
		checkout_status: 'CANCELED',
		afterPurchaseUrl: originalUrl,
	} );
} );

it( 'rejects a backend destination outside Pressable', async () => {
	post.mockResolvedValue( {
		afterPurchaseUrl: 'https://my.pressable.com.evil.test/titan_email/checkout_return',
	} );

	await expect( fetchPressableReturn( { agencyId: '42', receiptId: '99' } ) ).rejects.toThrow(
		'Invalid return destination.'
	);
} );
