/**
 * @vitest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import { getEstimatedCommission } from '../../lib/get-estimated-commission';
import useGetConsolidatedPayoutData from '../use-consolidated-payout-data';
import type { Referral } from '@automattic/api-core';

vi.mock( '../../lib/get-estimated-commission' );

const mockGetEstimatedCommission = getEstimatedCommission as Mock;

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
		vi.clearAllMocks();
		// Default mock — `getEstimatedCommission` is dispatched on
		// `usePreviousQuarter` so individual tests can override per-flag.
		mockGetEstimatedCommission.mockReturnValue( 50 );
	} );

	test( 'calls getEstimatedCommission once for each quarter flag', () => {
		renderHook( () => useGetConsolidatedPayoutData( mockReferrals ) );

		expect( mockGetEstimatedCommission ).toHaveBeenCalledTimes( 2 );
		expect( mockGetEstimatedCommission ).toHaveBeenCalledWith( mockReferrals, true );
		expect( mockGetEstimatedCommission ).toHaveBeenCalledWith( mockReferrals, false );
	} );

	test( 'returns the previous-quarter and current-quarter commissions from getEstimatedCommission', () => {
		mockGetEstimatedCommission.mockImplementation( ( _referrals, usePreviousQuarter ) =>
			usePreviousQuarter ? 75 : 50
		);

		const { result } = renderHook( () => useGetConsolidatedPayoutData( mockReferrals ) );

		expect( result.current.previousQuarterExpectedCommission ).toBe( 75 );
		expect( result.current.currentQuarterExpectedCommission ).toBe( 50 );
	} );

	test( 'counts pending referral statuses as pendingOrders', () => {
		const { result } = renderHook( () => useGetConsolidatedPayoutData( mockReferrals ) );

		expect( result.current.pendingOrders ).toBe( 1 );
	} );

	test( 'sums pendingOrders across multiple referrals', () => {
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
