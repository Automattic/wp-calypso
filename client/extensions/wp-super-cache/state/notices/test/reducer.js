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
	WP_SUPER_CACHE_RECEIVE_NOTICES,
	WP_SUPER_CACHE_REQUEST_NOTICES,
	WP_SUPER_CACHE_REQUEST_NOTICES_FAILURE,
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

	describe( 'requesting()', () => {
		const previousState = deepFreeze( {
			requesting: {
				[ primarySiteId ]: true,
			}
		} );

		it( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.requesting ).to.eql( {} );
		} );

		it( 'should set request to false if notices have been received', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_NOTICES,
				siteId: primarySiteId,
			} );

			expect( state.requesting ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		it( 'should set request to true if request in progress', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_REQUEST_NOTICES,
				siteId: primarySiteId,
			} );

			expect( state.requesting ).to.eql( {
				[ primarySiteId ]: true,
			} );
		} );

		it( 'should accumulate requesting values', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_REQUEST_NOTICES,
				siteId: secondarySiteId,
			} );

			expect( state.requesting ).to.eql( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		it( 'should set request to false if request finishes with failure', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_REQUEST_NOTICES_FAILURE,
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
			}
		};
		const secondaryNotices = {
			cache_readonly: {
				message: '/home/public_html/ is readonly.',
				type: 'warning',
			}
		};
		const previousState = deepFreeze( {
			items: {
				[ primarySiteId ]: primaryNotices,
			}
		} );

		it( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.items ).to.eql( {} );
		} );

		it( 'should index notices by site ID', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_RECEIVE_NOTICES,
				siteId: primarySiteId,
				notices: primaryNotices,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primaryNotices,
			} );
		} );

		it( 'should accumulate notices', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_NOTICES,
				siteId: secondarySiteId,
				notices: secondaryNotices,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primaryNotices,
				[ secondarySiteId ]: secondaryNotices,
			} );
		} );

		it( 'should override previous notices of same site ID', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_NOTICES,
				siteId: primarySiteId,
				notices: secondaryNotices,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: secondaryNotices,
			} );
		} );

		it( 'should accumulate new notices and overwrite existing ones for the same site ID', () => {
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
				type: WP_SUPER_CACHE_RECEIVE_NOTICES,
				siteId: primarySiteId,
				notices: newNotices,
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
				}
			} );
			const state = reducer( previousInvalidState, {
				type: DESERIALIZE,
			} );

			expect( state.items ).to.eql( {} );
		} );
	} );
} );
