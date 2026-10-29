/**
 * @jest-environment jsdom
 */
import { recordPurchase } from 'calypso/lib/analytics/record-purchase';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { recordCompletedPurchaseAnalytics } from '../record-completed-purchase-analytics';
import type { Receipt, ReceiptItem } from '@automattic/api-core';

jest.mock( 'calypso/lib/analytics/record-purchase', () => ( {
	recordPurchase: jest.fn(),
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
