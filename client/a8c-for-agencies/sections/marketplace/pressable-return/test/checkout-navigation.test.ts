/**
 * @jest-environment jsdom
 * @jest-environment-options {"url":"http://agencies.localhost:3000"}
 */
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { navigate } from 'calypso/lib/navigate';
import getThankYouPageUrl from 'calypso/my-sites/checkout/get-thank-you-page-url';
import { leaveCheckout } from 'calypso/my-sites/checkout/src/lib/leave-checkout';
import {
	addUrlToPendingPageRedirect,
	getRedirectFromPendingPage,
} from 'calypso/my-sites/checkout/src/lib/pending-page';
import {
	ASYNC_PENDING,
	FAILURE,
	SUCCESS,
} from 'calypso/my-sites/checkout/src/types/order-transaction';
import { getPressableReturnPath } from '../lib';

jest.mock( 'calypso/lib/navigate', () => ( { navigate: jest.fn() } ) );
jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( 'calypso/signup/storageUtils', () => ( {
	getSignupCompleteFlowName: () => undefined,
} ) );

beforeEach( () => {
	jest.clearAllMocks();
	window.history.replaceState( null, '', '/marketplace/checkout?skip_active_cart=1' );
} );

it( 'uses the internal return page ahead of the original external cart URL', () => {
	const successPath = `${ window.location.origin }${ getPressableReturnPath( 42 ) }`;
	expect(
		getThankYouPageUrl( {
			redirectTo: successPath,
			cart: {
				...getEmptyResponseCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						extra: {
							afterPurchaseUrl: 'https://my.pressable.com/titan_email/checkout_return',
						},
					},
				],
			},
		} )
	).toBe( successPath );
} );

it( 'resolves the internal receipt placeholder after an immediate or zero-due purchase', () => {
	const successPath = `${ window.location.origin }${ getPressableReturnPath( 42 ) }`;
	const pendingUrl = new URL(
		addUrlToPendingPageRedirect( successPath, { receiptId: 99, fromExternalCheckout: true } )
	);
	expect( pendingUrl.origin ).toBe( 'https://wordpress.com' );
	expect( pendingUrl.searchParams.get( 'redirect_to' ) ).toBe( successPath );
	expect(
		getRedirectFromPendingPage( {
			isLoadingOrder: false,
			receiptId: 99,
			redirectTo: pendingUrl.searchParams.get( 'redirect_to' ) ?? undefined,
		} )
	).toEqual( {
		url: 'http://agencies.localhost:3000/marketplace/pressable-return?agency_id=42&receipt_id=99',
	} );
} );

it( 'resolves the same page after provider completion or a pending-page reload', () => {
	expect(
		getRedirectFromPendingPage( {
			isLoadingOrder: false,
			orderId: 10,
			transaction: { orderId: 10, userId: 1, processingStatus: SUCCESS, receiptId: 99 },
			redirectTo: `${ window.location.origin }${ getPressableReturnPath( 42 ) }`,
		} )
	).toEqual( {
		url: 'http://agencies.localhost:3000/marketplace/pressable-return?agency_id=42&receipt_id=99',
	} );
} );

it( 'keeps pending and failed payments away from the return page', () => {
	const args = {
		isLoadingOrder: false,
		orderId: 10,
		redirectTo: `${ window.location.origin }${ getPressableReturnPath( 42 ) }`,
	};
	expect(
		getRedirectFromPendingPage( {
			...args,
			transaction: { orderId: 10, userId: 1, processingStatus: ASYNC_PENDING },
		} )
	).toBeUndefined();
	expect(
		getRedirectFromPendingPage( {
			...args,
			transaction: { orderId: 10, userId: 1, processingStatus: FAILURE },
		} )?.url
	).not.toContain( '/marketplace/pressable-return' );
} );

it( 'honors the prepared cancel_to URL used by the existing checkout close modal', () => {
	const cancelPath = getPressableReturnPath( 42, true );
	const originalLocation = window.location;
	const search = `?skip_active_cart=1&cancel_to=${ encodeURIComponent( cancelPath ) }`;
	Object.defineProperty( window, 'location', {
		value: {
			href: `https://example.com/marketplace/checkout${ search }`,
			origin: 'https://example.com',
			search,
		},
		configurable: true,
	} );
	try {
		leaveCheckout( {
			previousPath: '/marketplace',
			tracksEvent: 'calypso_masterbar_close_clicked',
			userHasClearedCart: true,
		} );
		expect( window.location.href ).toBe( cancelPath );
	} finally {
		Object.defineProperty( window, 'location', { value: originalLocation, configurable: true } );
	}
} );

it( 'uses the same cancellation page when the last item is removed', () => {
	const cancelPath = getPressableReturnPath( 42, true );
	leaveCheckout( {
		previousPath: cancelPath,
		tracksEvent: 'calypso_empty_cart_redirect',
		userHasClearedCart: true,
	} );
	expect( navigate ).toHaveBeenCalledWith( cancelPath );
} );
