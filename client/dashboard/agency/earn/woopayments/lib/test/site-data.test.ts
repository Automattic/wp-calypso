import * as payoutDateModule from '../../../referrals/lib/get-next-payout-date';
import { getSiteData } from '../site-data';
import type { WooPaymentsData } from '@automattic/api-core';

jest.mock( '../../../referrals/lib/get-next-payout-date' );

describe( 'getSiteData', () => {
	const mockWooPaymentsData: WooPaymentsData = {
		data: {
			total: {
				payout: 1000,
				tpv: 50000,
				transactions: 200,
				sites: {
					123: {
						payout: 500,
						tpv: 25000,
						transactions: 100,
					},
				},
			},
			estimated: {
				payout: 300,
				tpv: 15000,
				transactions: 60,
				current_quarter: {
					payout: 200,
					tpv: 10000,
					transactions: 40,
					sites: {
						123: {
							payout: 150,
							tpv: 7500,
							transactions: 30,
						},
					},
				},
				previous_quarter: {
					payout: 100,
					tpv: 5000,
					transactions: 20,
					sites: {
						123: {
							payout: 50,
							tpv: 2500,
							transactions: 10,
						},
					},
				},
			},
			commission_eligible_sites: [ 123 ],
			commission_ineligible_sites: [],
		},
		status: 'success',
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'includes only current quarter transactions when next and current payout dates are equal', () => {
		jest.spyOn( payoutDateModule, 'areNextAndCurrentPayoutDatesEqual' ).mockReturnValue( true );

		const result = getSiteData( mockWooPaymentsData, 123 );

		expect( result.transactions ).toBe( 130 ); // 100 (total) + 30 (current quarter)
		expect( result.estimatedPayout ).toBe( 150 ); // current quarter only
		expect( result.payout ).toBe( 500 );
	} );

	it( 'includes both current and previous quarter transactions when payout dates differ', () => {
		jest.spyOn( payoutDateModule, 'areNextAndCurrentPayoutDatesEqual' ).mockReturnValue( false );

		const result = getSiteData( mockWooPaymentsData, 123 );

		expect( result.transactions ).toBe( 140 ); // 100 (total) + 30 (current) + 10 (previous)
		expect( result.estimatedPayout ).toBe( 200 ); // 150 (current) + 50 (previous)
		expect( result.payout ).toBe( 500 );
	} );

	it( 'returns null transactions when site has no data', () => {
		jest.spyOn( payoutDateModule, 'areNextAndCurrentPayoutDatesEqual' ).mockReturnValue( true );

		const result = getSiteData( mockWooPaymentsData, 999 );

		expect( result.transactions ).toBe( 0 );
		expect( result.estimatedPayout ).toBe( 0 );
		expect( result.payout ).toBe( 0 );
	} );

	it( 'handles missing estimated data gracefully', () => {
		jest.spyOn( payoutDateModule, 'areNextAndCurrentPayoutDatesEqual' ).mockReturnValue( true );

		const dataWithoutEstimates: WooPaymentsData = {
			...mockWooPaymentsData,
			data: {
				...mockWooPaymentsData.data,
				estimated: {
					payout: 0,
					tpv: 0,
					transactions: 0,
					current_quarter: {
						payout: 0,
						tpv: 0,
						transactions: 0,
					},
					previous_quarter: {
						payout: 0,
						tpv: 0,
						transactions: 0,
					},
				},
			},
		};

		const result = getSiteData( dataWithoutEstimates, 123 );

		expect( result.transactions ).toBe( 100 ); // Only total transactions
		expect( result.estimatedPayout ).toBe( 0 );
		expect( result.payout ).toBe( 500 );
	} );

	it( 'returns estimated transactions even when completed transactions are zero (regression test)', () => {
		jest.spyOn( payoutDateModule, 'areNextAndCurrentPayoutDatesEqual' ).mockReturnValue( false );

		const newMerchantData: WooPaymentsData = {
			...mockWooPaymentsData,
			data: {
				...mockWooPaymentsData.data,
				total: {
					payout: 1000,
					tpv: 50000,
					transactions: 200,
					sites: {
						456: {
							payout: 0,
							tpv: 32000,
							transactions: 0,
						},
					},
				},
				estimated: {
					payout: 300,
					tpv: 15000,
					transactions: 60,
					current_quarter: {
						payout: 200,
						tpv: 10000,
						transactions: 40,
						sites: {
							456: {
								payout: 16,
								tpv: 20000,
								transactions: 25,
							},
						},
					},
					previous_quarter: {
						payout: 100,
						tpv: 5000,
						transactions: 20,
						sites: {
							456: {
								payout: 6,
								tpv: 12000,
								transactions: 15,
							},
						},
					},
				},
			},
		};

		const result = getSiteData( newMerchantData, 456 );

		expect( result.transactions ).toBe( 40 ); // 0 (total) + 25 (current) + 15 (previous)
		expect( result.estimatedPayout ).toBe( 22 ); // 16 (current) + 6 (previous)
		expect( result.payout ).toBe( 0 );
	} );
} );
