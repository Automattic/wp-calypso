/**
 * @jest-environment jsdom
 */
import { recordPurchase } from 'calypso/lib/analytics/record-purchase';
import { recordSignupComplete } from 'calypso/lib/analytics/signup';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { setSignupIsNewUser } from 'calypso/signup/storageUtils';
import { recordCompletedPurchaseAnalytics } from '../record-completed-purchase-analytics';
import type { Receipt, ReceiptItem } from '@automattic/api-core';

jest.mock( 'calypso/lib/analytics/record-purchase', () => ( {
	recordPurchase: jest.fn(),
} ) );
jest.mock( 'calypso/lib/analytics/signup', () => ( {
	...jest.requireActual( 'calypso/lib/analytics/signup' ),
	recordSignupComplete: jest.fn(),
} ) );
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );
jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

const mockRecordPurchase = recordPurchase as jest.MockedFunction< typeof recordPurchase >;

const makeReceipt = ( id: number, items: Partial< ReceiptItem >[] = [ {} ] ): Receipt =>
	( {
		id,
		items: items.map( ( item ) => ( { domain_bundle_group_id: null, ...item } ) ),
	} ) as Receipt;

describe( 'recordCompletedPurchaseAnalytics', () => {
	beforeEach( () => {
		window.localStorage.clear();
		jest.clearAllMocks();
		mockRecordPurchase.mockResolvedValue( undefined );
	} );

	it( 'records the purchase from the receipt', async () => {
		const receipt = makeReceipt( 1 );
		await recordCompletedPurchaseAnalytics( receipt );
		expect( mockRecordPurchase ).toHaveBeenCalledWith( receipt );
	} );

	it( 'records each receipt only once', async () => {
		await recordCompletedPurchaseAnalytics( makeReceipt( 1 ) );
		await recordCompletedPurchaseAnalytics( makeReceipt( 1 ) );
		await recordCompletedPurchaseAnalytics( makeReceipt( 2 ) );
		expect( mockRecordPurchase ).toHaveBeenCalledTimes( 2 );
	} );

	describe( 'static site import signup completion', () => {
		const context = { flow: 'static-site-import', userId: 123 };
		const plan: Partial< ReceiptItem > = {
			is_plan: true,
			type: 'new purchase',
			site_id: 42,
			product_id: 1008,
			wpcom_product_slug: 'business-bundle',
		};
		const receipt = { ...makeReceipt( 1, [ plan ] ), checkout_type: 'unified' };

		it.each( [ false, true ] )(
			'records the new site and purchased plan once (new user: %s)',
			async ( isNewUser ) => {
				if ( isNewUser ) {
					setSignupIsNewUser( context.userId );
				}
				await recordCompletedPurchaseAnalytics( receipt, context );
				await recordCompletedPurchaseAnalytics( receipt, context );

				expect( recordSignupComplete ).toHaveBeenCalledTimes( 1 );
				expect( recordSignupComplete ).toHaveBeenCalledWith(
					expect.objectContaining( {
						flow: 'static-site-import',
						siteId: 42,
						isNewUser,
						hasCartItems: true,
						planProductSlug: 'business-bundle',
						framework: 'stepper',
					} ),
					true
				);
			}
		);

		it.each( [ undefined, 'wpcom' ] )(
			'does not record an existing-site upgrade (checkout type: %s)',
			async ( checkoutType ) => {
				await recordCompletedPurchaseAnalytics(
					{ ...receipt, checkout_type: checkoutType },
					context
				);

				expect( recordSignupComplete ).not.toHaveBeenCalled();
			}
		);

		it.each( [ undefined, 'onboarding-unified' ] )(
			'does not record signup for another flow (%s)',
			async ( flow ) => {
				await recordCompletedPurchaseAnalytics( receipt, { ...context, flow } );

				expect( recordSignupComplete ).not.toHaveBeenCalled();
			}
		);

		it.each( [
			{ items: [] },
			{ items: [ { ...plan, site_id: 0 } ] },
			{ items: [ { ...plan, type: 'recurring' as const } ] },
		] )(
			'does not record without a new plan purchase attached to a site (%j)',
			async ( { items } ) => {
				await recordCompletedPurchaseAnalytics(
					{ ...makeReceipt( 1, items ), checkout_type: 'unified' },
					context
				);

				expect( recordSignupComplete ).not.toHaveBeenCalled();
			}
		);

		it( 'does not record signup when the plan failed to provision', async () => {
			await recordCompletedPurchaseAnalytics(
				{
					...receipt,
					failed_purchases: {
						42: [
							{
								product_id: 1008,
								product_slug: 'business-bundle',
								product_meta: '',
								product_cost: 300,
								product_name: 'Business',
							},
						],
					},
				},
				context
			);

			expect( recordSignupComplete ).not.toHaveBeenCalled();
		} );
	} );

	it( 'records one event per domain bundle', async () => {
		await recordCompletedPurchaseAnalytics(
			makeReceipt( 1, [
				{ domain_bundle_group_id: 'group-a' },
				{ domain_bundle_group_id: 'group-a' },
				{ domain_bundle_group_id: 'group-b' },
				{ domain_bundle_group_id: null },
			] )
		);
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 2 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_domain_bundle_purchased', {
			domain_bundle_group_id: 'group-a',
			domain_count: 2,
		} );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_domain_bundle_purchased', {
			domain_bundle_group_id: 'group-b',
			domain_count: 1,
		} );
	} );

	it( 'resolves and reports the error when recording fails', async () => {
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		mockRecordPurchase.mockRejectedValue( new Error( 'script failed' ) );
		await expect( recordCompletedPurchaseAnalytics( makeReceipt( 1 ) ) ).resolves.toBeUndefined();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_checkout_composite_error', {
			error_message: 'script failed',
			action_type: 'recordCompletedPurchaseAnalytics',
		} );
	} );

	it( 'resolves after a timeout if recording does not finish', async () => {
		jest.useFakeTimers();
		mockRecordPurchase.mockReturnValue( new Promise( () => {} ) );
		const result = recordCompletedPurchaseAnalytics( makeReceipt( 1 ) );
		jest.advanceTimersByTime( 3000 );
		await expect( result ).resolves.toBeUndefined();
		jest.useRealTimers();
	} );
} );
