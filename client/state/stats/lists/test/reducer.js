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
	requesting
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
			'requesting',
			'items'
		] );
	} );

	describe( 'requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track stats list request fetching', () => {
			const state = requesting( undefined, {
				type: SITE_STATS_REQUEST,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQuery
			} );

			expect( state ).to.eql( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': true
					}
				}
			} );
		} );

		it( 'should accumulate queries', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': true
					}
				}
			} );

			const state = requesting( original, {
				type: SITE_STATS_REQUEST,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQueryDos
			} );

			expect( state ).to.eql( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': true,
						'[["endDate","2015-06-01"],["startDate","2014-06-01"]]': true
					}
				}
			} );
		} );

		it( 'should track stats request success', () => {
			const state = requesting( undefined, {
				type: SITE_STATS_REQUEST_SUCCESS,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQuery
			} );

			expect( state ).to.eql( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': false
					}
				}
			} );
		} );

		it( 'should track stats request failure', () => {
			const state = requesting( undefined, {
				type: SITE_STATS_REQUEST_FAILURE,
				siteId: 2916284,
				statType: 'statsStreak',
				query: streakQuery,
				error: new Error()
			} );

			expect( state ).to.eql( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-06-01"],["startDate","2015-06-01"]]': false
					}
				}
			} );
		} );

		it( 'should never persist state', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': true
					}
				}
			} );

			const state = requesting( original, { type: SERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should never load persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					statsStreak: {
						'[["endDate","2016-07-01"],["startDate","2016-06-01"]]': true
					}
				}
			} );

			const state = requesting( original, { type: DESERIALIZE } );

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
