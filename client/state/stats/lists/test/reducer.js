/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { items, requests } from '../reducer';
import {
	DESERIALIZE,
	SERIALIZE,
	SITE_STATS_RECEIVE,
	SITE_STATS_REQUEST,
	SITE_STATS_REQUEST_FAILURE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

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
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'requests', 'items' ] );
	} );

	describe( 'requests()', () => {
		test( 'should default to an empty object', () => {
			const state = requests( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track stats list request fetching', () => {
			const state = requests( undefined, {
				type: SITE_STATS_REQUEST,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQuery,
			} );

			expect( state ).to.eql( {
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

			expect( state ).to.eql( {
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

			expect( state ).to.eql( {
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

			expect( state ).to.eql( {
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

		test( 'should not persist state', () => {
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

			const state = requests( original, { type: SERIALIZE } );

			expect( state ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
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

			const state = requests( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
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
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( original );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse,
					},
				},
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( original );
		} );

		test( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse,
				},
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should add received stats', () => {
			const state = items( undefined, {
				type: SITE_STATS_RECEIVE,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQuery,
				data: streakResponse,
			} );

			expect( state ).to.eql( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': streakResponse,
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

			expect( state ).to.eql( {
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

			expect( state[ 2916284 ] ).to.not.equal( original[ 2916284 ] );
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

			expect( state ).to.eql( {
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

		test( 'should should not change another statTypes property', () => {
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

			expect( state[ 2916284 ].statsStreak ).to.equal( original[ 2916284 ].statsStreak );
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

			expect( state[ 2916284 ].statsStreak ).to.equal( original[ 2916284 ].statsStreak );
		} );
	} );
} );
