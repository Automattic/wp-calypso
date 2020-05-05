/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	WP_SUPER_CACHE_DELETE_CACHE,
	WP_SUPER_CACHE_DELETE_CACHE_FAILURE,
	WP_SUPER_CACHE_DELETE_CACHE_SUCCESS,
	WP_SUPER_CACHE_PRELOAD_CACHE,
	WP_SUPER_CACHE_PRELOAD_CACHE_FAILURE,
	WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS,
	WP_SUPER_CACHE_TEST_CACHE,
	WP_SUPER_CACHE_TEST_CACHE_FAILURE,
	WP_SUPER_CACHE_TEST_CACHE_SUCCESS,
} from '../../action-types';
import reducer from '../reducer';
import { SERIALIZE, DESERIALIZE } from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	describe( 'deleteStatus()', () => {
		const previousState = deepFreeze( {
			deleteStatus: {
				[ primarySiteId ]: {
					deleting: true,
					status: 'pending',
				},
			},
		} );

		test( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.deleteStatus ).to.eql( {} );
		} );

		test( 'should set request to true if request in progress', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_DELETE_CACHE,
				siteId: primarySiteId,
			} );

			expect( state.deleteStatus ).to.eql( {
				[ primarySiteId ]: {
					deleting: true,
					status: 'pending',
				},
			} );
		} );

		test( 'should accumulate requesting values', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_DELETE_CACHE,
				siteId: secondarySiteId,
			} );

			expect( state.deleteStatus ).to.eql( {
				[ primarySiteId ]: {
					deleting: true,
					status: 'pending',
				},
				[ secondarySiteId ]: {
					deleting: true,
					status: 'pending',
				},
			} );
		} );

		test( 'should set request to false if request finishes successfully', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_DELETE_CACHE_SUCCESS,
				siteId: primarySiteId,
			} );

			expect( state.deleteStatus ).to.eql( {
				[ primarySiteId ]: {
					deleting: false,
					status: 'success',
				},
			} );
		} );

		test( 'should set request to false if request finishes with failure', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_DELETE_CACHE_FAILURE,
				siteId: primarySiteId,
			} );

			expect( state.deleteStatus ).to.eql( {
				[ primarySiteId ]: {
					deleting: false,
					status: 'error',
				},
			} );
		} );

		test( 'should not persist state', () => {
			const state = reducer( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
			const state = reducer( previousState, {
				type: DESERIALIZE,
			} );

			expect( state.deleteStatus ).to.eql( {} );
		} );
	} );

	describe( 'testing()', () => {
		const previousState = deepFreeze( {
			testing: {
				[ primarySiteId ]: true,
			},
		} );

		test( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.testing ).to.eql( {} );
		} );

		test( 'should set testing value to true if request in progress', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_TEST_CACHE,
				siteId: primarySiteId,
			} );

			expect( state.testing ).to.eql( {
				[ primarySiteId ]: true,
			} );
		} );

		test( 'should accumulate testing values', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_TEST_CACHE,
				siteId: secondarySiteId,
			} );

			expect( state.testing ).to.eql( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		test( 'should set testing value to false if request finishes successfully', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_TEST_CACHE_SUCCESS,
				siteId: primarySiteId,
			} );

			expect( state.testing ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		test( 'should set testing value to false if request finishes with failure', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_TEST_CACHE_FAILURE,
				siteId: primarySiteId,
			} );

			expect( state.testing ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		test( 'should not persist state', () => {
			const state = reducer( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
			const state = reducer( previousState, {
				type: DESERIALIZE,
			} );

			expect( state.testing ).to.eql( {} );
		} );
	} );

	describe( 'preloading()', () => {
		const previousState = deepFreeze( {
			preloading: {
				[ primarySiteId ]: true,
			},
		} );

		test( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.preloading ).to.eql( {} );
		} );

		test( 'should set preloading value to true if request in progress', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_PRELOAD_CACHE,
				siteId: primarySiteId,
			} );

			expect( state.preloading ).to.eql( {
				[ primarySiteId ]: true,
			} );
		} );

		test( 'should accumulate preloading values', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_PRELOAD_CACHE,
				siteId: secondarySiteId,
			} );

			expect( state.preloading ).to.eql( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		test( 'should set preloading value to false if request finishes successfully', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS,
				siteId: primarySiteId,
			} );

			expect( state.preloading ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		test( 'should set preloading value to false if request finishes with failure', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_PRELOAD_CACHE_FAILURE,
				siteId: primarySiteId,
			} );

			expect( state.preloading ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		test( 'should not persist state', () => {
			const state = reducer( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
			const state = reducer( previousState, {
				type: DESERIALIZE,
			} );

			expect( state.preloading ).to.eql( {} );
		} );
	} );

	describe( 'items()', () => {
		const primaryResults = {
			attempts: {
				first: {
					status: 'OK',
				},
			},
		};
		const secondaryResults = {
			attempts: {
				second: {
					status: 'FAILED',
				},
			},
		};
		const previousState = deepFreeze( {
			items: {
				[ primarySiteId ]: primaryResults,
			},
		} );

		test( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.items ).to.eql( {} );
		} );

		test( 'should index cache test results by site ID', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_TEST_CACHE_SUCCESS,
				siteId: primarySiteId,
				data: primaryResults,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primaryResults,
			} );
		} );

		test( 'should accumulate cache test results', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_TEST_CACHE_SUCCESS,
				siteId: secondarySiteId,
				data: secondaryResults,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primaryResults,
				[ secondarySiteId ]: secondaryResults,
			} );
		} );

		test( 'should override previous cache test results of same site ID', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_TEST_CACHE_SUCCESS,
				siteId: primarySiteId,
				data: secondaryResults,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: secondaryResults,
			} );
		} );

		test( 'should accumulate new cache test results and overwrite existing ones for the same site ID', () => {
			const newResults = {
				attempts: {
					first: {
						status: 'OK',
					},
					second: {
						status: 'FAILED',
					},
				},
			};
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_TEST_CACHE_SUCCESS,
				siteId: primarySiteId,
				data: newResults,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: newResults,
			} );
		} );

		test( 'should not persist state', () => {
			const state = reducer( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
			const state = reducer( previousState, {
				type: DESERIALIZE,
			} );

			expect( state.items ).to.eql( {} );
		} );
	} );
} );
