/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import * as getEstimatedCommission from '../../lib/get-estimated-commission';
import useGetConsolidatedPayoutData from '../use-get-consolidated-payout-data';
import type { Referral } from '../../types';

jest.mock( '../../lib/get-estimated-commission' );

const mockGetEstimatedCommission =
	getEstimatedCommission.getEstimatedCommission as jest.MockedFunction<
		typeof getEstimatedCommission.getEstimatedCommission
	>;

describe( 'useGetConsolidatedPayoutData', () => {
	const mockReferrals: Referral[] = [
		{
			referralStatuses: [ 'active', 'pending' ],
			purchaseStatuses: [ 'active' ],
			purchases: [
				{
					product_id: 1,
					status: 'active',
					quantity: 1,
				},
				{
					product_id: 2,
					status: 'active',
					quantity: 1,
				},
			],
		},
	] as never;

	beforeEach( () => {
		jest.clearAllMocks();
		// Default mock — `getEstimatedCommission` is dispatched on
		// `usePreviousQuarter` so individual tests can override per-flag.
		mockGetEstimatedCommission.mockReturnValue( 50 );
	} );

	it( 'calls getEstimatedCommission once for each quarter flag', () => {
		renderHook( () => useGetConsolidatedPayoutData( mockReferrals ) );

		expect( mockGetEstimatedCommission ).toHaveBeenCalledTimes( 2 );
		expect( mockGetEstimatedCommission ).toHaveBeenCalledWith( mockReferrals, true );
		expect( mockGetEstimatedCommission ).toHaveBeenCalledWith( mockReferrals, false );
	} );

	it( 'returns the previous-quarter and current-quarter commissions from getEstimatedCommission', () => {
		mockGetEstimatedCommission.mockImplementation( ( _referrals, usePreviousQuarter ) =>
			usePreviousQuarter ? 75 : 50
		);

		const { result } = renderHook( () => useGetConsolidatedPayoutData( mockReferrals ) );

		expect( result.current.previousQuarterExpectedCommission ).toBe( 75 );
		expect( result.current.currentQuarterExpectedCommission ).toBe( 50 );
	} );

	it( 'counts pending referral statuses as pendingOrders', () => {
		const { result } = renderHook( () => useGetConsolidatedPayoutData( mockReferrals ) );

		expect( result.current.pendingOrders ).toBe( 1 );
	} );

	it( 'sums pendingOrders across multiple referrals', () => {
		const multipleReferrals: Referral[] = [
			{
				referralStatuses: [ 'active', 'pending' ],
				purchaseStatuses: [ 'active' ],
				purchases: [],
			},
			{
				referralStatuses: [ 'pending', 'pending' ],
				purchaseStatuses: [ 'active' ],
				purchases: [],
			},
			{
				referralStatuses: [ 'active' ],
				purchaseStatuses: [ 'active' ],
				purchases: [],
			},
		] as never;

		const { result } = renderHook( () => useGetConsolidatedPayoutData( multipleReferrals ) );

		// 1 from the first referral + 2 from the second = 3.
		expect( result.current.pendingOrders ).toBe( 3 );
	} );
} );
