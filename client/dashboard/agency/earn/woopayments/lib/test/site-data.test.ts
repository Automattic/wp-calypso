import * as payoutDatesModule from '../payout-dates';
import { getSiteData } from '../site-data';
import type { AgencyWooPaymentsData } from '@automattic/api-core';

jest.mock( '../payout-dates' );

const data: AgencyWooPaymentsData = {
	status: 'ok',
	data: {
		total: { payout: 0, tpv: 0, transactions: 0, sites: { 1: { payout: 100, transactions: 5 } } },
		estimated: {
			payout: 0,
			tpv: 0,
			transactions: 0,
			current_quarter: {
				payout: 0,
				tpv: 0,
				transactions: 0,
				sites: { 1: { payout: 20, transactions: 2 } },
			},
			previous_quarter: {
				payout: 0,
				tpv: 0,
				transactions: 0,
				sites: { 1: { payout: 10, transactions: 1 } },
			},
		},
	},
};

beforeEach( () => {
	jest.clearAllMocks();
} );

test( 'includes only the current-quarter estimate when next and current payout dates are equal', () => {
	jest.spyOn( payoutDatesModule, 'areNextAndCurrentPayoutDatesEqual' ).mockReturnValue( true );

	const result = getSiteData( data, 1 );

	expect( result.payout ).toBe( 100 );
	expect( result.estimatedPayout ).toBe( 20 );
	expect( result.transactions ).toBe( 7 ); // 5 (completed) + 2 (current quarter)
} );

test( 'includes both current- and previous-quarter estimates when payout dates differ', () => {
	jest.spyOn( payoutDatesModule, 'areNextAndCurrentPayoutDatesEqual' ).mockReturnValue( false );

	const result = getSiteData( data, 1 );

	expect( result.payout ).toBe( 100 );
	expect( result.estimatedPayout ).toBe( 30 ); // 20 (current) + 10 (previous)
	expect( result.transactions ).toBe( 8 ); // 5 (completed) + 2 (current) + 1 (previous)
} );

test( 'returns zeros for an unknown site', () => {
	jest.spyOn( payoutDatesModule, 'areNextAndCurrentPayoutDatesEqual' ).mockReturnValue( true );

	const result = getSiteData( data, 999 );

	expect( result ).toEqual( { transactions: 0, payout: 0, estimatedPayout: 0 } );
} );
