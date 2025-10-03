/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import * as getEstimatedCommission from '../../lib/get-estimated-commission';
import * as getNextPayoutDate from '../../lib/get-next-payout-date';
import useGetConsolidatedPayoutData from '../use-get-consolidated-payout-data';
import type { Referral } from '../../types';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

// Mock the dependencies
jest.mock( '../../lib/get-estimated-commission' );
jest.mock( '../../lib/get-next-payout-date' );

const mockGetEstimatedCommission =
	getEstimatedCommission.getEstimatedCommission as jest.MockedFunction<
		typeof getEstimatedCommission.getEstimatedCommission
	>;
const mockGetNextPayoutDateActivityWindow =
	getNextPayoutDate.getNextPayoutDateActivityWindow as jest.MockedFunction<
		typeof getNextPayoutDate.getNextPayoutDateActivityWindow
	>;
const mockGetCurrentCycleActivityWindow =
	getNextPayoutDate.getCurrentCycleActivityWindow as jest.MockedFunction<
		typeof getNextPayoutDate.getCurrentCycleActivityWindow
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
					license: {
						issued_at: '2024-01-01T00:00:00Z',
						revoked_at: null,
					},
				},
				{
					product_id: 2,
					status: 'active',
					quantity: 1,
					license: {
						issued_at: '2024-01-15T00:00:00Z',
						revoked_at: null,
					},
				},
			],
		},
	] as never;

	const mockProducts: APIProductFamilyProduct[] = [
		{
			product_id: 1,
			family_slug: 'jetpack-backup',
			price_per_unit: 100,
			supported_bundles: [],
			name: 'Mock Product',
			slug: 'mock-product',
			currency: 'USD',
			amount: '100',
			price_interval: 'month',
		},
		{
			product_id: 2,
			family_slug: 'jetpack-security',
			price_per_unit: 150,
			supported_bundles: [],
			name: 'Mock Product 2',
			slug: 'mock-product-2',
			currency: 'USD',
			amount: '150',
			price_interval: 'month',
		},
	];

	const mockActivityWindow = {
		start: new Date( '2024-01-01' ),
		finish: new Date( '2024-03-31' ),
	};

	beforeEach( () => {
		jest.clearAllMocks();
		mockGetNextPayoutDateActivityWindow.mockReturnValue( mockActivityWindow );
		mockGetCurrentCycleActivityWindow.mockReturnValue( mockActivityWindow );
		mockGetEstimatedCommission.mockReturnValue( 50 );
	} );

	it( 'should calculate previous quarter expected commission', () => {
		const { result } = renderHook( () =>
			useGetConsolidatedPayoutData( mockReferrals, mockProducts )
		);

		expect( mockGetEstimatedCommission ).toHaveBeenCalledWith(
			mockReferrals,
			mockProducts,
			mockActivityWindow,
			false // use current quarter
		);
		expect( mockGetEstimatedCommission ).toHaveBeenCalledWith(
			mockReferrals,
			mockProducts,
			mockActivityWindow,
			true // use previous quarter
		);
		expect( result.current.previousQuarterExpectedCommission ).toBe( 50 );
	} );

	it( 'should calculate current quarter expected commission', () => {
		const { result } = renderHook( () =>
			useGetConsolidatedPayoutData( mockReferrals, mockProducts )
		);

		expect( mockGetEstimatedCommission ).toHaveBeenCalledWith(
			mockReferrals,
			mockProducts,
			mockActivityWindow,
			false // use current quarter
		);
		expect( mockGetEstimatedCommission ).toHaveBeenCalledWith(
			mockReferrals,
			mockProducts,
			mockActivityWindow,
			true // use previous quarter
		);
		expect( result.current.currentQuarterExpectedCommission ).toBe( 50 );
	} );

	it( 'should calculate pending orders count', () => {
		const { result } = renderHook( () =>
			useGetConsolidatedPayoutData( mockReferrals, mockProducts )
		);

		expect( result.current.pendingOrders ).toBe( 1 );
	} );

	it( 'should handle multiple referrals with mixed statuses', () => {
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

		const { result } = renderHook( () =>
			useGetConsolidatedPayoutData( multipleReferrals, mockProducts )
		);

		// Should count 3 pending orders (1 from first referral, 2 from second referral)
		expect( result.current.pendingOrders ).toBe( 3 );
	} );

	it( 'should handle scenario where one purchase was revoked in previous quarter', () => {
		const referralsWithRevokedPurchase: Referral[] = [
			{
				referralStatuses: [ 'active', 'pending' ],
				purchaseStatuses: [ 'active', 'revoked' ],
				purchases: [
					{
						product_id: 1,
						status: 'active',
						quantity: 1,
						license: {
							issued_at: '2024-01-01T00:00:00Z',
							revoked_at: null,
						},
					},
					{
						product_id: 2,
						status: 'revoked',
						quantity: 1,
						license: {
							issued_at: '2024-01-15T00:00:00Z',
							revoked_at: '2024-02-15T00:00:00Z', // Revoked in previous quarter
						},
					},
				],
			},
		] as never;

		// Mock different activity windows for previous and current quarter
		const previousQuarterWindow = {
			start: new Date( '2024-01-01' ),
			finish: new Date( '2024-03-31' ),
		};
		const currentQuarterWindow = {
			start: new Date( '2024-04-01' ),
			finish: new Date( '2024-06-30' ),
		};

		mockGetNextPayoutDateActivityWindow.mockReturnValue( previousQuarterWindow );
		mockGetCurrentCycleActivityWindow.mockReturnValue( currentQuarterWindow );

		// Mock commission calculation - previous quarter should have 2 products, current should have 1
		mockGetEstimatedCommission.mockImplementation( ( referrals, products, activityWindow ) => {
			if ( activityWindow === previousQuarterWindow ) {
				return 75; // Commission for 2 products (before revocation)
			} else if ( activityWindow === currentQuarterWindow ) {
				return 50; // Commission for 1 product (after revocation)
			}
			return 0;
		} );

		const { result } = renderHook( () =>
			useGetConsolidatedPayoutData( referralsWithRevokedPurchase, mockProducts )
		);

		expect( mockGetEstimatedCommission ).toHaveBeenCalledWith(
			referralsWithRevokedPurchase,
			mockProducts,
			currentQuarterWindow,
			false // use current quarter
		);
		expect( mockGetEstimatedCommission ).toHaveBeenCalledWith(
			referralsWithRevokedPurchase,
			mockProducts,
			previousQuarterWindow,
			true // use previous quarter
		);
		expect( result.current.previousQuarterExpectedCommission ).toBe( 75 );
		expect( result.current.currentQuarterExpectedCommission ).toBe( 50 );
		expect( result.current.pendingOrders ).toBe( 1 ); // Only 1 pending order (active status)
	} );
} );
