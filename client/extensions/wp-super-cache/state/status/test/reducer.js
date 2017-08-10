/** @format */
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
	WP_SUPER_CACHE_RECEIVE_STATUS,
	WP_SUPER_CACHE_REQUEST_STATUS,
	WP_SUPER_CACHE_REQUEST_STATUS_FAILURE,
} from '../../action-types';
import { SERIALIZE, DESERIALIZE } from 'state/action-types';
import reducer from '../reducer';

describe( 'reducer', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	useSandbox( sandbox => {
		sandbox.stub( console, 'warn' );
	} );

	describe( 'requesting()', () => {
		const previousState = deepFreeze( {
			requesting: {
				[ primarySiteId ]: true,
			},
		} );

		it( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.requesting ).to.eql( {} );
		} );

		it( 'should set request to false if status have been received', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_STATUS,
				siteId: primarySiteId,
			} );

			expect( state.requesting ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		it( 'should set request to true if request in progress', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_REQUEST_STATUS,
				siteId: primarySiteId,
			} );

			expect( state.requesting ).to.eql( {
				[ primarySiteId ]: true,
			} );
		} );

		it( 'should accumulate requesting values', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_REQUEST_STATUS,
				siteId: secondarySiteId,
			} );

			expect( state.requesting ).to.eql( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		it( 'should set request to false if request finishes with failure', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_REQUEST_STATUS_FAILURE,
				siteId: primarySiteId,
			} );

			expect( state.requesting ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		it( 'should not persist state', () => {
			const state = reducer( previousState, {
				type: SERIALIZE,
			} );

			expect( state.requesting ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = reducer( previousState, {
				type: DESERIALIZE,
			} );

			expect( state.requesting ).to.eql( {} );
		} );
	} );

	describe( 'items()', () => {
		const primaryNotices = {
			cache_writable: {
				message: '/home/public_html/ is writable.',
				type: 'warning',
			},
		};
		const secondaryNotices = {
			cache_readonly: {
				message: '/home/public_html/ is readonly.',
				type: 'warning',
			},
		};
		const previousState = deepFreeze( {
			items: {
				[ primarySiteId ]: primaryNotices,
			},
		} );

		it( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.items ).to.eql( {} );
		} );

		it( 'should index status by site ID', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_RECEIVE_STATUS,
				siteId: primarySiteId,
				status: primaryNotices,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primaryNotices,
			} );
		} );

		it( 'should accumulate status', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_STATUS,
				siteId: secondarySiteId,
				status: secondaryNotices,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primaryNotices,
				[ secondarySiteId ]: secondaryNotices,
			} );
		} );

		it( 'should override previous status of same site ID', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_STATUS,
				siteId: primarySiteId,
				status: secondaryNotices,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: secondaryNotices,
			} );
		} );

		it( 'should accumulate new status and overwrite existing ones for the same site ID', () => {
			const newNotices = {
				cache_writable: {
					message: '/home/public_html/ is writable.',
					type: 'warning',
				},
				cache_readonly: {
					message: '/home/public_html/ is readonly.',
					type: 'warning',
				},
			};
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_STATUS,
				siteId: primarySiteId,
				status: newNotices,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: newNotices,
			} );
		} );

		it( 'should persist state', () => {
			const state = reducer( previousState, {
				type: SERIALIZE,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primaryNotices,
			} );
		} );

		it( 'should load valid persisted state', () => {
			const state = reducer( previousState, {
				type: DESERIALIZE,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primaryNotices,
			} );
		} );

		it( 'should not load invalid persisted state', () => {
			const previousInvalidState = deepFreeze( {
				items: {
					[ primarySiteId ]: 2,
				},
			} );
			const state = reducer( previousInvalidState, {
				type: DESERIALIZE,
			} );

			expect( state.items ).to.eql( {} );
		} );
	} );
} );
