/**
 * @jest-environment jsdom
 * @jest-environment-options {"url":"http://agencies.localhost:3000"}
 */
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import getThankYouPageUrl from 'calypso/my-sites/checkout/get-thank-you-page-url';
import {
	addUrlToPendingPageRedirect,
	getRedirectFromPendingPage,
} from 'calypso/my-sites/checkout/src/lib/pending-page';
import { SUCCESS } from 'calypso/my-sites/checkout/src/types/order-transaction';
import { getPressableReturnPath } from '../lib';

jest.mock( 'calypso/lib/navigate', () => ( { navigate: jest.fn() } ) );
jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( 'calypso/signup/storageUtils', () => ( {
	getSignupCompleteFlowName: () => undefined,
} ) );

const successPath = `http://agencies.localhost:3000${ getPressableReturnPath( 42, 99 ) }`;

it( 'keeps referral SUCCESS and its receipt through immediate or zero-due checkout', () => {
	expect(
		getThankYouPageUrl( {
			redirectTo: successPath,
			cart: {
				...getEmptyResponseCart(),
				products: [
					{
						...getEmptyResponseCartProduct(),
						extra: {
							afterPurchaseUrl:
								'https://my.pressable.com/titan_email/checkout_return?agency_id=42-cli-7&signature=original',
						},
					},
				],
			},
		} )
	).toBe( successPath );
	const pendingUrl = new URL(
		addUrlToPendingPageRedirect( successPath, { receiptId: 501, fromExternalCheckout: true } )
	);
	expect(
		getRedirectFromPendingPage( {
			isLoadingOrder: false,
			receiptId: 501,
			redirectTo: pendingUrl.searchParams.get( 'redirect_to' ) ?? undefined,
		} )
	).toEqual( {
		url: 'http://agencies.localhost:3000/client/pressable-return?agency_id=42&referral_id=99&receipt_id=501',
	} );
} );

it( 'retains the referral SUCCESS route after provider completion or a pending-page reload', () => {
	expect(
		getRedirectFromPendingPage( {
			isLoadingOrder: false,
			orderId: 10,
			transaction: { orderId: 10, userId: 1, processingStatus: SUCCESS, receiptId: 501 },
			redirectTo: successPath,
		} )
	).toEqual( {
		url: 'http://agencies.localhost:3000/client/pressable-return?agency_id=42&referral_id=99&receipt_id=501',
	} );
} );
