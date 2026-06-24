import { getEstimatedCommission } from '../get-estimated-commission';
import type { Referral } from '../../types';

describe( 'getEstimatedCommission', () => {
	it( 'returns 0 for empty referrals', () => {
		expect( getEstimatedCommission( [] ) ).toBe( 0 );
	} );

	it( 'sums current-quarter commissions across purchases', () => {
		const referrals: Referral[] = [
			{
				purchaseStatuses: [ 'active' ],
				referralStatuses: [ 'active' ],
				purchases: [
					{
						product_id: 1,
						status: 'active',
						quantity: 1,
						commissions: {
							estimated_commission_current_quarter: 150,
							estimated_commission_previous_quarter: 75,
						},
					},
					{
						product_id: 2,
						status: 'active',
						quantity: 1,
						commissions: {
							estimated_commission_current_quarter: 200,
							estimated_commission_previous_quarter: 100,
						},
					},
				],
			} as never,
		];

		expect( getEstimatedCommission( referrals ) ).toBe( 350 );
	} );

	it( 'sums previous-quarter commissions when usePreviousQuarter is true', () => {
		const referrals: Referral[] = [
			{
				purchaseStatuses: [ 'active' ],
				referralStatuses: [ 'active' ],
				purchases: [
					{
						product_id: 1,
						status: 'active',
						quantity: 1,
						commissions: {
							estimated_commission_current_quarter: 150,
							estimated_commission_previous_quarter: 75,
						},
					},
					{
						product_id: 2,
						status: 'active',
						quantity: 1,
						commissions: {
							estimated_commission_current_quarter: 200,
							estimated_commission_previous_quarter: 100,
						},
					},
				],
			} as never,
		];

		expect( getEstimatedCommission( referrals, true ) ).toBe( 175 );
	} );

	it( 'sums commissions across multiple referrals', () => {
		const referrals: Referral[] = [
			{
				purchaseStatuses: [ 'active' ],
				referralStatuses: [ 'active' ],
				purchases: [
					{
						product_id: 1,
						status: 'active',
						quantity: 1,
						commissions: {
							estimated_commission_current_quarter: 150,
							estimated_commission_previous_quarter: 75,
						},
					},
				],
			} as never,
			{
				purchaseStatuses: [ 'active' ],
				referralStatuses: [ 'active' ],
				purchases: [
					{
						product_id: 1,
						status: 'active',
						quantity: 1,
						commissions: {
							estimated_commission_current_quarter: 200,
							estimated_commission_previous_quarter: 100,
						},
					},
				],
			} as never,
		];

		expect( getEstimatedCommission( referrals ) ).toBe( 350 );
	} );

	it( 'includes cancelled purchases', () => {
		// Cancelled purchases still contribute commissions for the days they
		// were active (the server-side compute already accounts for the
		// revoked window).
		const referrals: Referral[] = [
			{
				purchaseStatuses: [ 'cancelled' ],
				referralStatuses: [ 'cancelled' ],
				purchases: [
					{
						product_id: 1,
						status: 'cancelled',
						quantity: 1,
						commissions: {
							estimated_commission_current_quarter: 50,
							estimated_commission_previous_quarter: 25,
						},
					},
				],
			} as never,
		];

		expect( getEstimatedCommission( referrals ) ).toBe( 50 );
	} );

	it( 'skips pending purchases', () => {
		const referrals: Referral[] = [
			{
				purchaseStatuses: [ 'pending' ],
				referralStatuses: [ 'pending' ],
				purchases: [
					{
						product_id: 1,
						status: 'pending',
						quantity: 1,
						commissions: {
							estimated_commission_current_quarter: 999,
							estimated_commission_previous_quarter: 999,
						},
					},
				],
			} as never,
		];

		expect( getEstimatedCommission( referrals ) ).toBe( 0 );
	} );

	it( 'skips error purchases', () => {
		const referrals: Referral[] = [
			{
				purchaseStatuses: [ 'error' ],
				referralStatuses: [ 'active' ],
				purchases: [
					{
						product_id: 1,
						status: 'error',
						quantity: 1,
						commissions: {
							estimated_commission_current_quarter: 999,
							estimated_commission_previous_quarter: 999,
						},
					},
				],
			} as never,
		];

		expect( getEstimatedCommission( referrals ) ).toBe( 0 );
	} );

	it( 'contributes 0 for purchases without a commissions block', () => {
		// In production every purchase carries server-supplied commissions.
		// Defensive coverage for the rare case where the field is missing —
		// must contribute 0 rather than fall back to the (now-removed) JS
		// compute that double-counted alongside the BD branch.
		const referrals: Referral[] = [
			{
				purchaseStatuses: [ 'active' ],
				referralStatuses: [ 'active' ],
				purchases: [
					{
						product_id: 1,
						status: 'active',
						quantity: 1,
					},
				],
			} as never,
		];

		expect( getEstimatedCommission( referrals ) ).toBe( 0 );
	} );

	it( 'rounds the total to 2 decimal places', () => {
		const referrals: Referral[] = [
			{
				purchaseStatuses: [ 'active' ],
				referralStatuses: [ 'active' ],
				purchases: [
					{
						product_id: 1,
						status: 'active',
						quantity: 1,
						commissions: {
							estimated_commission_current_quarter: 10.111,
							estimated_commission_previous_quarter: 5,
						},
					},
					{
						product_id: 2,
						status: 'active',
						quantity: 1,
						commissions: {
							estimated_commission_current_quarter: 20.222,
							estimated_commission_previous_quarter: 5,
						},
					},
				],
			} as never,
		];

		expect( getEstimatedCommission( referrals ) ).toBe( 30.33 );
	} );
} );
