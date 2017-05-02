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
	WP_SUPER_CACHE_RECEIVE_TEST_CACHE_RESULTS,
	WP_SUPER_CACHE_TEST_CACHE,
	WP_SUPER_CACHE_TEST_CACHE_FAILURE,
	WP_SUPER_CACHE_TEST_CACHE_SUCCESS,
} from '../../action-types';
import {
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import reducer from '../reducer';

describe( 'reducer', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	describe( 'testStatus()', () => {
		const previousState = deepFreeze( {
			testStatus: {
				[ primarySiteId ]: {
					testing: true,
					status: 'pending',
				}
			}
		} );

		it( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.testStatus ).to.eql( {} );
		} );

		it( 'should set cache test status to pending if request in progress', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_TEST_CACHE,
				siteId: primarySiteId,
			} );

			expect( state.testStatus ).to.eql( {
				[ primarySiteId ]: {
					testing: true,
					status: 'pending',
				}
			} );
		} );

		it( 'should accumulate cache test request statuses', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_TEST_CACHE,
				siteId: secondarySiteId,
			} );

			expect( state.testStatus ).to.eql( {
				[ primarySiteId ]: {
					testing: true,
					status: 'pending',
				},
				[ secondarySiteId ]: {
					testing: true,
					status: 'pending',
				}
			} );
		} );

		it( 'should set cache test request to success if request finishes successfully', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_TEST_CACHE_SUCCESS,
				siteId: primarySiteId,
			} );

			expect( state.testStatus ).to.eql( {
				[ primarySiteId ]: {
					testing: false,
					status: 'success',
				}
			} );
		} );

		it( 'should set cache test request to error if request finishes with failure', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_TEST_CACHE_FAILURE,
				siteId: primarySiteId,
			} );

			expect( state.testStatus ).to.eql( {
				[ primarySiteId ]: {
					testing: false,
					status: 'error',
				}
			} );
		} );

		it( 'should not persist state', () => {
			const state = reducer( previousState, {
				type: SERIALIZE,
			} );

			expect( state.testStatus ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = reducer( previousState, {
				type: DESERIALIZE,
			} );

			expect( state.testStatus ).to.eql( {} );
		} );
	} );

	describe( 'items()', () => {
		const primaryResults = {
			attempts: {
				first: {
					status: 'OK',
				}
			}
		};
		const secondaryResults = {
			attempts: {
				second: {
					status: 'FAILED',
				}
			}
		};
		const previousState = deepFreeze( {
			items: {
				[ primarySiteId ]: primaryResults,
			}
		} );

		it( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.items ).to.eql( {} );
		} );

		it( 'should index cache test results by site ID', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_RECEIVE_TEST_CACHE_RESULTS,
				siteId: primarySiteId,
				results: primaryResults,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primaryResults,
			} );
		} );

		it( 'should accumulate cache test results', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_TEST_CACHE_RESULTS,
				siteId: secondarySiteId,
				results: secondaryResults,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primaryResults,
				[ secondarySiteId ]: secondaryResults,
			} );
		} );

		it( 'should override previous cache test results of same site ID', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_TEST_CACHE_RESULTS,
				siteId: primarySiteId,
				results: secondaryResults,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: secondaryResults,
			} );
		} );

		it( 'should accumulate new cache test results and overwrite existing ones for the same site ID', () => {
			const newResults = {
				attempts: {
					first: {
						status: 'OK',
					},
					second: {
						status: 'FAILED',
					}
				}
			};
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_TEST_CACHE_RESULTS,
				siteId: primarySiteId,
				results: newResults,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: newResults,
			} );
		} );

		it( 'should not persist state', () => {
			const state = reducer( previousState, {
				type: SERIALIZE,
			} );

			expect( state.items ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = reducer( previousState, {
				type: DESERIALIZE,
			} );

			expect( state.items ).to.eql( {} );
		} );
	} );
} );
