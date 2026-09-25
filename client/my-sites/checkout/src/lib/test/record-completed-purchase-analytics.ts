/**
 * @jest-environment jsdom
 */
import { recordPurchase } from 'calypso/lib/analytics/record-purchase';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { recordCompletedPurchaseAnalytics } from '../record-completed-purchase-analytics';
import type { Receipt, ReceiptItem } from '@automattic/api-core';

jest.mock( 'calypso/lib/analytics/record-purchase', () => ( {
	recordPurchase: jest.fn(),
} ) );
jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( ( name, props ) => ( { type: 'TRACKS', name, props } ) ),
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
		await recordCompletedPurchaseAnalytics( receipt, jest.fn() );
		expect( mockRecordPurchase ).toHaveBeenCalledWith( receipt );
	} );

	it( 'records each receipt only once', async () => {
		await recordCompletedPurchaseAnalytics( makeReceipt( 1 ), jest.fn() );
		await recordCompletedPurchaseAnalytics( makeReceipt( 1 ), jest.fn() );
		await recordCompletedPurchaseAnalytics( makeReceipt( 2 ), jest.fn() );
		expect( mockRecordPurchase ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'records one event per domain bundle', async () => {
		const dispatch = jest.fn();
		await recordCompletedPurchaseAnalytics(
			makeReceipt( 1, [
				{ domain_bundle_group_id: 'group-a' },
				{ domain_bundle_group_id: 'group-a' },
				{ domain_bundle_group_id: 'group-b' },
				{ domain_bundle_group_id: null },
			] ),
			dispatch
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
		const dispatch = jest.fn();
		await expect(
			recordCompletedPurchaseAnalytics( makeReceipt( 1 ), dispatch )
		).resolves.toBeUndefined();
		expect( dispatch ).toHaveBeenCalledWith( expect.any( Function ) );
	} );

	it( 'resolves after a timeout if recording does not finish', async () => {
		jest.useFakeTimers();
		mockRecordPurchase.mockReturnValue( new Promise( () => {} ) );
		const result = recordCompletedPurchaseAnalytics( makeReceipt( 1 ), jest.fn() );
		jest.advanceTimersByTime( 3000 );
		await expect( result ).resolves.toBeUndefined();
		jest.useRealTimers();
	} );
} );
