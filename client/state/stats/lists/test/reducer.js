/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import {
	DESERIALIZE,
	SERIALIZE,
	SITE_STATS_RECEIVE,
	SITE_STATS_REQUEST,
	SITE_STATS_REQUEST_FAILURE,
	SITE_STATS_REQUEST_SUCCESS,
} from 'state/action-types';
import reducer, {
	items,
	requests
} from '../reducer';

/**
 * Test Data
 */
const streakResponse = {
	data: {
		1461961382: 1,
		1464110402: 1,
		1464110448: 1
	}
};

const streakResponseDos = {
	data: {
		1464110448: 1
	}
};

const streakQuery = { startDate: '2015-06-01', endDate: '2016-06-01' };
const streakQueryDos = { startDate: '2014-06-01', endDate: '2015-06-01' };

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'requests',
			'items'
		] );
	} );

	describe( 'requests()', () => {
		it( 'should default to an empty object', () => {
			const state = requests( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track stats list request fetching', () => {
			const state = requests( undefined, {
				type: SITE_STATS_REQUEST,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQuery
			} );

			expect( state ).to.eql( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': { requesting: true, status: 'pending' }
					}
				}
			} );
		} );

		it( 'should accumulate queries', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': { requesting: true, status: 'pending' }
					}
				}
			} );

			const state = requests( original, {
				type: SITE_STATS_REQUEST,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQueryDos
			} );

			expect( state ).to.eql( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': { requesting: true, status: 'pending' },
						'[["endDate","2015-06-01"],["startDate","2014-06-01"]]': { requesting: true, status: 'pending' }
					}
				}
			} );
		} );

		it( 'should track stats request success', () => {
			const today = new Date();
			const state = requests( undefined, {
				type: SITE_STATS_REQUEST_SUCCESS,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQuery,
				date: today
			} );

			expect( state ).to.eql( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': { requesting: false, status: 'success', date: today }
					}
				}
			} );
		} );

		it( 'should track stats request failure', () => {
			const state = requests( undefined, {
				type: SITE_STATS_REQUEST_FAILURE,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQuery,
				error: new Error()
			} );

			expect( state ).to.eql( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': { requesting: false, status: 'error' }
					}
				}
			} );
		} );

		it( 'should not persist state', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': { requesting: true, status: 'pending' }
					}
				}
			} );

			const state = requests( original, { type: SERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': { requesting: true, status: 'pending' }
					}
				}
			} );

			const state = requests( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'items()', () => {
		it( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse
					}
				}
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse
					}
				}
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse
				}
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should add received stats', () => {
			const state = items( undefined, {
				type: SITE_STATS_RECEIVE,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQuery,
				data: streakResponse
			} );

			expect( state ).to.eql( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': streakResponse
					}
				}
			} );
		} );

		it( 'should accumulate received stats by statType', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse
					}
				}
			} );

			const state = items( original, {
				type: SITE_STATS_RECEIVE,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQueryDos,
				data: streakResponseDos
			} );

			expect( state ).to.eql( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse,
						'[["endDate","2015-06-01"],["startDate","2014-06-01"]]': streakResponseDos,
					}
				}
			} );
		} );

		it( 'should add additional statTypes', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse
					}
				}
			} );

			const state = items( original, {
				type: SITE_STATS_RECEIVE,
				siteId: 2916284,
				statType: 'statsCountryViews',
				query: streakQuery,
				data: {}
			} );

			expect( state ).to.eql( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': streakResponse
					},
					statsCountryViews: {
						'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': {}
					}
				}
			} );
		} );
	} );
} );
