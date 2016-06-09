/**
 * External dependencies
 */
import { expect } from 'chai';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	getSerializedStatsQuery,
	getStatsStreakQuery
} from '../utils';

describe( 'utils', () => {
	describe( 'getSerializedStatsQuery()', () => {
		it( 'should return a JSON string of a query', () => {
			const serializedQuery = getSerializedStatsQuery( {
				startDate: '2016-06-01',
				endDate: '2016-07-01'
			} );

			expect( serializedQuery ).to.equal( '[["endDate","2016-07-01"],["startDate","2016-06-01"]]' );
		} );

		it( 'should return the same JSON string of a query regardless of query object order', () => {
			const serializedQuery = getSerializedStatsQuery( {
				startDate: '2016-06-01',
				endDate: '2016-07-01'
			} );

			const serializedQueryTwo = getSerializedStatsQuery( {
				endDate: '2016-07-01',
				startDate: '2016-06-01'
			} );

			expect( serializedQuery ).to.eql( serializedQueryTwo );
		} );
	} );

	describe( 'getStatsStreakQuery()', () => {
		it( 'should return the correct default query', () => {
			const streakQuery = getStatsStreakQuery();

			expect( streakQuery ).to.eql( {
				startDate: i18n.moment().subtract( 1, 'year' ).startOf( 'month' ).format( 'YYYY-MM-DD' ),
				endDate: i18n.moment().endOf( 'month' ).format( 'YYYY-MM-DD' ),
				max: 3000
			} );
		} );

		it( 'should allow defaults to be over-ridden', () => {
			const streakQuery = getStatsStreakQuery( {
				startDate: '1999-12-31',
				endDate: 'out-of-time'
			} );

			expect( streakQuery ).to.eql( {
				startDate: '1999-12-31',
				endDate: 'out-of-time',
				max: 3000
			} );
		} );
	} );
} );
