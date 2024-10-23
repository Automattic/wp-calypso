import { STATS_CHART_COUNTS_REQUEST, STATS_CHART_COUNTS_RECEIVE } from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { counts, isLoading } from '../reducer';

describe( 'reducer', () => {
	const siteId = 1234;
	const date = '2018-09-20';
	const period = 'day';
	const quantity = 1;
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

		const requestKey = `${ date }-${ period }-${ quantity }`;

		test( 'should append count records onto the state if no prior records exist', () => {
			const state = counts( undefined, {
				type: STATS_CHART_COUNTS_RECEIVE,
				siteId,
				period,
				data: responseWithViews,
				requestKey,
			} );

			expect( state ).toEqual( {
				[ siteId ]: {
					[ requestKey ]: [
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
					[ siteId ]: { [ requestKey ]: responseWithViews },
				},
				{
					type: STATS_CHART_COUNTS_RECEIVE,
					siteId,
					period,
					data: responseWithVisitors,
					requestKey,
				}
			);

			expect( state ).toEqual( {
				[ siteId ]: {
					[ requestKey ]: [
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
					[ siteId ]: { [ requestKey ]: responseWithViews },
				},
				{
					type: STATS_CHART_COUNTS_RECEIVE,
					siteId,
					period,
					data: responseWithADifferentPeriod,
					requestKey,
				}
			);

			expect( state ).toEqual( {
				[ siteId ]: {
					[ requestKey ]: [
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

		test( 'should serialize and deserialize state', () => {
			const state = {
				[ siteId ]: { [ period ]: responseWithViews },
			};

			expect( serialize( counts, state ).root() ).toEqual( state );
			expect( deserialize( counts, state ) ).toEqual( state );
		} );
	} );

	describe( '#isLoading()', () => {
		test( 'should default to an empty object', () => {
			expect( isLoading( undefined, {} ) ).toEqual( {} );
		} );

		const requestKey = `${ date }-${ period }-${ quantity }`;

		test( 'should mark status as loading upon receving the corresponding event', () => {
			const state = isLoading( undefined, {
				type: STATS_CHART_COUNTS_REQUEST,
				siteId,
				period,
				statFields: [ 'views', 'visitors' ],
				requestKey,
			} );
			expect( state ).toEqual( {
				[ siteId ]: {
					[ requestKey ]: {
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
						[ requestKey ]: {
							apples: false,
						},
					},
				},
				{
					type: STATS_CHART_COUNTS_REQUEST,
					siteId,
					period,
					statFields: [ 'views', 'visitors' ],
					requestKey,
				}
			);
			expect( state ).toEqual( {
				[ siteId ]: {
					[ requestKey ]: {
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
				requestKey,
			} );
			expect( state ).toEqual( {
				[ siteId ]: {
					[ requestKey ]: {
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
						[ requestKey ]: {
							apples: true,
						},
					},
				},
				{
					type: STATS_CHART_COUNTS_RECEIVE,
					siteId,
					period,
					data: responseWithViewsAndVisitors,
					requestKey,
				}
			);

			expect( state ).toEqual( {
				[ siteId ]: {
					[ requestKey ]: {
						apples: true,
						views: false,
						visitors: false,
					},
				},
			} );
		} );
	} );
} );
