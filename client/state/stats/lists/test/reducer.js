import deepFreeze from 'deep-freeze';
import {
	SITE_STATS_RECEIVE,
	SITE_STATS_REQUEST,
	SITE_STATS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import reducer, { items, requests } from '../reducer';

/**
 * Test Data
 */
const streakResponse = {
	data: {
		1461961382: 1,
		1464110402: 1,
		1464110448: 1,
	},
};

const streakResponseDos = {
	data: {
		1464110448: 1,
	},
};

const streakQuery = { startDate: '2015-06-01', endDate: '2016-06-01' };
const streakQueryDos = { startDate: '2014-06-01', endDate: '2015-06-01' };

describe( 'reducer', () => {
	jest.spyOn( console, 'warn' ).mockImplementation();

	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'requests', 'items' ] )
		);
	} );

	describe( 'requests()', () => {
		test( 'should default to an empty object', () => {
			const state = requests( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should track stats list request fetching', () => {
			const state = requests( undefined, {
				type: SITE_STATS_REQUEST,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQuery,
			} );

			expect( state ).toEqual( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': {
							requesting: true,
							status: 'pending',
						},
					},
				},
			} );
		} );

		test( 'should accumulate queries', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': {
							requesting: true,
							status: 'pending',
						},
					},
				},
			} );

			const state = requests( original, {
				type: SITE_STATS_REQUEST,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQueryDos,
			} );

			expect( state ).toEqual( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': {
							requesting: true,
							status: 'pending',
						},
						'[["endDate","2015-06-01"],["startDate","2014-06-01"]]': {
							requesting: true,
							status: 'pending',
						},
					},
				},
			} );
		} );

		test( 'should track stats request success', () => {
			const today = new Date();
			const state = requests( undefined, {
				type: SITE_STATS_RECEIVE,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQuery,
				data: streakResponse,
				date: today,
			} );

			expect( state ).toEqual( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': {
							requesting: false,
							status: 'success',
							date: today,
						},
					},
				},
			} );
		} );

		test( 'should track stats request failure', () => {
			const state = requests( undefined, {
				type: SITE_STATS_REQUEST_FAILURE,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQuery,
				error: new Error(),
			} );

			expect( state ).toEqual( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': {
							requesting: false,
							status: 'error',
						},
					},
				},
			} );
		} );
	} );

	describe( 'items()', () => {
		test( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse,
					},
				},
			} );
			const state = serialize( items, original );

			expect( state ).toEqual( original );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse,
					},
				},
			} );
			const state = deserialize( items, original );

			expect( state ).toEqual( original );
		} );

		test( 'should not load persisted state with invalid statType', () => {
			const original = deepFreeze( {
				2916284: {
					'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse,
				},
			} );
			const state = deserialize( items, original );

			expect( state ).toEqual( {} );
		} );

		test( 'should not load persisted state with invalid query', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'query-withou-square-brackets': streakResponse,
					},
				},
			} );
			const state = deserialize( items, original );

			expect( state ).toEqual( {} );
		} );

		test( 'should not load persisted state with non-object data', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': '',
					},
				},
			} );
			const state = deserialize( items, original );

			expect( state ).toEqual( {} );
		} );

		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should add received stats', () => {
			const state = items( undefined, {
				type: SITE_STATS_RECEIVE,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQuery,
				data: streakResponse,
			} );

			expect( state ).toEqual( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': streakResponse,
					},
				},
			} );
		} );

		test( 'should receive invalid stats as null', () => {
			const state = items( undefined, {
				type: SITE_STATS_RECEIVE,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQuery,
				data: '',
			} );

			expect( state ).toEqual( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': null,
					},
				},
			} );
		} );

		test( 'should accumulate received stats by statType', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse,
					},
				},
			} );

			const state = items( original, {
				type: SITE_STATS_RECEIVE,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQueryDos,
				data: streakResponseDos,
			} );

			expect( state ).toEqual( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse,
						'[["endDate","2015-06-01"],["startDate","2014-06-01"]]': streakResponseDos,
					},
				},
			} );
		} );

		test( 'should change root site property when received stats by statType', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse,
					},
				},
			} );

			const state = items( original, {
				type: SITE_STATS_RECEIVE,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQueryDos,
				data: streakResponseDos,
			} );

			expect( state[ 2916284 ] ).not.toEqual( original[ 2916284 ] );
		} );

		test( 'should add additional statTypes', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse,
					},
				},
			} );

			const state = items( original, {
				type: SITE_STATS_RECEIVE,
				siteId: 2916284,
				statType: 'statsCountryViews',
				query: streakQuery,
				data: {},
			} );

			expect( state ).toEqual( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse,
					},
					statsCountryViews: {
						'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': {},
					},
				},
			} );
		} );

		test( 'should not change another statTypes property', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse,
					},
				},
			} );

			const state = items( original, {
				type: SITE_STATS_RECEIVE,
				siteId: 2916284,
				statType: 'statsCountryViews',
				query: streakQuery,
				data: {},
			} );

			expect( state[ 2916284 ].statsStreak ).toEqual( original[ 2916284 ].statsStreak );
		} );

		test( 'should not change another site property', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse,
					},
				},
			} );

			const state = items( original, {
				type: SITE_STATS_RECEIVE,
				siteId: 3916284,
				statType: 'statsCountryViews',
				query: streakQuery,
				data: {},
			} );

			expect( state[ 2916284 ].statsStreak ).toEqual( original[ 2916284 ].statsStreak );
		} );
	} );
} );
