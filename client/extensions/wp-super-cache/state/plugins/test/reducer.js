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
	WP_SUPER_CACHE_RECEIVE_PLUGINS,
	WP_SUPER_CACHE_REQUEST_PLUGINS,
	WP_SUPER_CACHE_REQUEST_PLUGINS_FAILURE,
	WP_SUPER_CACHE_REQUEST_PLUGINS_SUCCESS,
	WP_SUPER_CACHE_TOGGLE_PLUGIN,
	WP_SUPER_CACHE_TOGGLE_PLUGIN_FAILURE,
	WP_SUPER_CACHE_TOGGLE_PLUGIN_SUCCESS,
} from '../../action-types';
import {
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import {
	items,
	requesting,
	toggling,
} from '../reducer';

describe( 'reducer', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	describe( 'requesting()', () => {
		const previousState = deepFreeze( {
			[ primarySiteId ]: true,
		} );

		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should set request to true if request in progress', () => {
			const state = requesting( undefined, {
				type: WP_SUPER_CACHE_REQUEST_PLUGINS,
				siteId: primarySiteId,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: true,
			} );
		} );

		it( 'should accumulate requesting values', () => {
			const state = requesting( previousState, {
				type: WP_SUPER_CACHE_REQUEST_PLUGINS,
				siteId: secondarySiteId,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		it( 'should set request to false if request finishes successfully', () => {
			const state = requesting( previousState, {
				type: WP_SUPER_CACHE_REQUEST_PLUGINS_SUCCESS,
				siteId: primarySiteId,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		it( 'should set request to false if request finishes with failure', () => {
			const state = requesting( previousState, {
				type: WP_SUPER_CACHE_REQUEST_PLUGINS_FAILURE,
				siteId: primarySiteId,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		it( 'should not persist state', () => {
			const state = requesting( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = requesting( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'toggling()', () => {
		const previousState = deepFreeze( {
			[ primarySiteId ]: { no_adverts_for_friends: true }
		} );

		it( 'should default to an empty object', () => {
			const state = toggling( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should set toggling status to true if request in progress', () => {
			const state = toggling( undefined, {
				type: WP_SUPER_CACHE_TOGGLE_PLUGIN,
				siteId: primarySiteId,
				plugin: 'no_adverts_for_friends',
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: { no_adverts_for_friends: true }
			} );
		} );

		it( 'should accumulate toggling statuses', () => {
			const state = toggling( previousState, {
				type: WP_SUPER_CACHE_TOGGLE_PLUGIN,
				siteId: secondarySiteId,
				plugin: 'awaitingmoderation',
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: { no_adverts_for_friends: true },
				[ secondarySiteId ]: { awaitingmoderation: true }
			} );
		} );

		it( 'should set toggling status to false if request finishes successfully', () => {
			const state = toggling( previousState, {
				type: WP_SUPER_CACHE_TOGGLE_PLUGIN_SUCCESS,
				siteId: primarySiteId,
				plugin: 'no_adverts_for_friends',
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: { no_adverts_for_friends: false }
			} );
		} );

		it( 'should set toggling status to false if request finishes with failure', () => {
			const state = toggling( previousState, {
				type: WP_SUPER_CACHE_TOGGLE_PLUGIN_FAILURE,
				siteId: primarySiteId,
				plugin: 'no_adverts_for_friends',
				error: 'my error',
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: { no_adverts_for_friends: false }
			} );
		} );

		it( 'should not persist state', () => {
			const state = toggling( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = toggling( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'items()', () => {
		const primaryPlugins = {
			awaitingmoderation: {
				url: '',
				title: 'Awaiting Moderation',
				desc: 'Enables or disables plugin to Remove the text "Your comment is awaiting moderation." ...',
				enabled: true,
			}
		};
		const secondaryPlugins = {
			no_adverts_for_friends: {
				key: 'no_adverts_for_friends',
				url: 'https://odd.blog/no-adverts-for-friends/',
				title: 'No Adverts for Friends',
				desc: 'Provides support for No Adverts for Friends plugin.',
				enabled: false
			}
		};
		const previousState = deepFreeze( {
			[ primarySiteId ]: primaryPlugins,
		} );

		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index plugins by site ID', () => {
			const state = items( undefined, {
				type: WP_SUPER_CACHE_RECEIVE_PLUGINS,
				siteId: primarySiteId,
				plugins: primaryPlugins,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: primaryPlugins,
			} );
		} );

		it( 'should accumulate plugins', () => {
			const state = items( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_PLUGINS,
				siteId: secondarySiteId,
				plugins: secondaryPlugins,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: primaryPlugins,
				[ secondarySiteId ]: secondaryPlugins,
			} );
		} );

		it( 'should override previous plugins of same site ID', () => {
			const state = items( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_PLUGINS,
				siteId: primarySiteId,
				plugins: secondaryPlugins,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: secondaryPlugins,
			} );
		} );

		it( 'should accumulate new plugins and overwrite existing ones for the same site ID', () => {
			const newPlugins = { is_cache_enabled: false, is_super_cache_enabled: true };
			const state = items( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_PLUGINS,
				siteId: primarySiteId,
				plugins: newPlugins,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: { is_cache_enabled: false, is_super_cache_enabled: true },
			} );
		} );

		it( 'should persist state', () => {
			const state = items( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: primaryPlugins,
			} );
		} );

		it( 'should load valid persisted state', () => {
			const state = items( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: primaryPlugins,
			} );
		} );

		it( 'should not load invalid persisted state', () => {
			const previousInvalidState = deepFreeze( {
				items: {
					[ primarySiteId ]: 2,
				}
			} );
			const state = items( previousInvalidState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );
	} );
} );
