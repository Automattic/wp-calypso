/**
 * Internal dependencies
 */
import { STATS_CHART_COUNTS_REQUEST, STATS_CHART_COUNTS_RECEIVE } from 'calypso/state/action-types';
import { counts, isLoading } from '../reducer';

describe( 'reducer', () => {
	const siteId = 1234;
	const period = 'day';
	const responseWithViews = [
		{
			period: '2018-09-20',
			views: 247,
			labelDay: 'Sep 20',
			classNames: [],
		},
	];
	const responseWithVisitors = [
		{
			period: '2018-09-20',
			visitors: 20,
			labelDay: 'Sep 20',
			classNames: [],
		},
	];
	const responseWithADifferentPeriod = [
		{
			period: '2018-09-30',
			views: 487,
			labelDay: 'Sep 30',
			classNames: [],
		},
	];
	const responseWithViewsAndVisitors = [
		{ ...responseWithViews[ 0 ], ...responseWithVisitors[ 0 ] },
	];

	describe( '#counts()', () => {
		test( 'should default to an empty object', () => {
			expect( counts( undefined, {} ) ).toEqual( {} );
		} );

		test( 'should append count records onto the state if no prior records exist', () => {
			const state = counts( undefined, {
				type: STATS_CHART_COUNTS_RECEIVE,
				siteId,
				period,
				data: responseWithViews,
			} );

			expect( state ).toEqual( {
				[ siteId ]: {
					[ period ]: [
						{
							period: '2018-09-20',
							views: 247,
							labelDay: 'Sep 20',
							classNames: [],
						},
					],
				},
			} );
		} );

		test( 'should merge count records with the same siteId and period', () => {
			const state = counts(
				{
					[ siteId ]: { [ period ]: responseWithViews },
				},
				{
					type: STATS_CHART_COUNTS_RECEIVE,
					siteId,
					period,
					data: responseWithVisitors,
				}
			);

			expect( state ).toEqual( {
				[ siteId ]: {
					[ period ]: [
						{
							period: '2018-09-20',
							views: 247,
							visitors: 20,
							labelDay: 'Sep 20',
							classNames: [],
						},
					],
				},
			} );
		} );

		test( 'should not merge count records with differing period values', () => {
			const state = counts(
				{
					[ siteId ]: { [ period ]: responseWithViews },
				},
				{
					type: STATS_CHART_COUNTS_RECEIVE,
					siteId,
					period,
					data: responseWithADifferentPeriod,
				}
			);

			expect( state ).toEqual( {
				[ siteId ]: {
					[ period ]: [
						{
							period: '2018-09-30',
							views: 487,
							labelDay: 'Sep 30',
							classNames: [],
						},
					],
				},
			} );
		} );
	} );

	describe( '#isLoading()', () => {
		test( 'should default to an empty object', () => {
			expect( isLoading( undefined, {} ) ).toEqual( {} );
		} );

		test( 'should mark status as loading upon receving the corresponding event', () => {
			const state = isLoading( undefined, {
				type: STATS_CHART_COUNTS_REQUEST,
				siteId,
				period,
				statFields: [ 'views', 'visitors' ],
			} );
			expect( state ).toEqual( {
				[ siteId ]: {
					[ period ]: {
						views: true,
						visitors: true,
					},
				},
			} );
		} );

		test( 'should keep existing loading status when issuing request for other fields', () => {
			const state = isLoading(
				{
					[ siteId ]: {
						[ period ]: {
							apples: false,
						},
					},
				},
				{
					type: STATS_CHART_COUNTS_REQUEST,
					siteId,
					period,
					statFields: [ 'views', 'visitors' ],
				}
			);
			expect( state ).toEqual( {
				[ siteId ]: {
					[ period ]: {
						apples: false,
						views: true,
						visitors: true,
					},
				},
			} );
		} );

		test( 'should mark status as done upon receving the corresponding event', () => {
			const state = isLoading( undefined, {
				type: STATS_CHART_COUNTS_RECEIVE,
				siteId,
				period,
				data: responseWithViewsAndVisitors,
			} );
			expect( state ).toEqual( {
				[ siteId ]: {
					[ period ]: {
						views: false,
						visitors: false,
					},
				},
			} );
		} );

		test( 'should keep existing loading status when receiving response with other fields', () => {
			const state = isLoading(
				{
					[ siteId ]: {
						[ period ]: {
							apples: true,
						},
					},
				},
				{
					type: STATS_CHART_COUNTS_RECEIVE,
					siteId,
					period,
					data: responseWithViewsAndVisitors,
				}
			);

			expect( state ).toEqual( {
				[ siteId ]: {
					[ period ]: {
						apples: true,
						views: false,
						visitors: false,
					},
				},
			} );
		} );
	} );
} );
