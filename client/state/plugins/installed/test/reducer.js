/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { ACTIVATE_PLUGIN } from '../constants';
import { isRequesting, plugins } from '../reducer';
import status from '../status/reducer';
import { akismet, jetpack } from './fixtures/plugins';
import {
	PLUGINS_RECEIVE,
	PLUGINS_REQUEST,
	PLUGINS_REQUEST_SUCCESS,
	PLUGINS_REQUEST_FAILURE,
	PLUGIN_ACTIVATE_REQUEST,
	PLUGIN_ACTIVATE_REQUEST_SUCCESS,
	PLUGIN_ACTIVATE_REQUEST_FAILURE,
	PLUGIN_DEACTIVATE_REQUEST_SUCCESS,
	PLUGIN_UPDATE_REQUEST_SUCCESS,
	PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS,
	PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS,
	PLUGIN_INSTALL_REQUEST_SUCCESS,
	PLUGIN_REMOVE_REQUEST_SUCCESS,
	PLUGIN_NOTICES_REMOVE,
} from 'calypso/state/action-types';

describe( 'reducer:', () => {
	describe( 'isRequesting', () => {
		test( 'should track when fetches start', () => {
			const state = isRequesting( undefined, {
				type: PLUGINS_REQUEST,
				siteId: 'one.site',
			} );
			expect( state ).to.eql( { 'one.site': true } );
		} );

		test( 'should track when fetches end successfully', () => {
			const state = isRequesting( undefined, {
				type: PLUGINS_REQUEST_SUCCESS,
				siteId: 'one.site',
			} );
			expect( state ).to.eql( { 'one.site': false } );
		} );

		test( 'should track when fetches end unsuccessfully', () => {
			const state = isRequesting( undefined, {
				type: PLUGINS_REQUEST_FAILURE,
				siteId: 'one.site',
			} );
			expect( state ).to.eql( { 'one.site': false } );
		} );
	} );

	describe( 'plugins', () => {
		test( 'should load the plugins on this site', () => {
			const originalState = deepFreeze( { 'one.site': [] } );
			const state = plugins( originalState, {
				type: PLUGINS_RECEIVE,
				siteId: 'one.site',
				data: [ akismet ],
			} );
			expect( state ).to.eql( { 'one.site': [ akismet ] } );
		} );

		test( 'should show an activated plugin as active', () => {
			const originalState = deepFreeze( {
				'one.site': [ Object.assign( {}, akismet, { active: false } ) ],
			} );
			const state = plugins( originalState, {
				type: PLUGIN_ACTIVATE_REQUEST_SUCCESS,
				siteId: 'one.site',
				pluginId: akismet.id,
				data: Object.assign( {}, akismet, { active: true } ),
			} );
			expect( state ).to.eql( { 'one.site': [ Object.assign( {}, akismet, { active: true } ) ] } );
		} );

		test( 'should show a deactivated plugin as inactive', () => {
			const originalState = deepFreeze( {
				'one.site': [ Object.assign( {}, akismet, { active: true } ) ],
			} );
			const state = plugins( originalState, {
				type: PLUGIN_DEACTIVATE_REQUEST_SUCCESS,
				siteId: 'one.site',
				pluginId: akismet.id,
				data: Object.assign( {}, akismet, { active: false } ),
			} );
			expect( state ).to.eql( { 'one.site': [ Object.assign( {}, akismet, { active: false } ) ] } );
		} );

		test( 'should show an updated plugin as up-to-date', () => {
			const originalState = deepFreeze( { 'one.site': [ jetpack ] } );
			const updatedPlugin = { ...jetpack, update: { recentlyUpdated: true } };
			const state = plugins( originalState, {
				type: PLUGIN_UPDATE_REQUEST_SUCCESS,
				siteId: 'one.site',
				pluginId: jetpack.id,
				data: updatedPlugin,
			} );
			expect( state ).to.eql( { 'one.site': [ updatedPlugin ] } );
		} );

		test( 'should show a plugin with autoupdate enabled', () => {
			const originalState = deepFreeze( {
				'one.site': [ Object.assign( {}, akismet, { autoupdate: false } ) ],
			} );
			const state = plugins( originalState, {
				type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS,
				siteId: 'one.site',
				pluginId: jetpack.id,
				data: Object.assign( {}, akismet, { autoupdate: true } ),
			} );
			expect( state ).to.eql( {
				'one.site': [ Object.assign( {}, akismet, { autoupdate: true } ) ],
			} );
		} );

		test( 'should show a plugin with autoupdate disabled', () => {
			const originalState = deepFreeze( {
				'one.site': [ Object.assign( {}, akismet, { autoupdate: true } ) ],
			} );
			const state = plugins( originalState, {
				type: PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS,
				siteId: 'one.site',
				pluginId: jetpack.id,
				data: Object.assign( {}, akismet, { autoupdate: false } ),
			} );
			expect( state ).to.eql( {
				'one.site': [ Object.assign( {}, akismet, { autoupdate: false } ) ],
			} );
		} );

		test( 'should load a new plugin when installed', () => {
			const originalState = deepFreeze( { 'one.site': [ akismet ] } );
			const state = plugins( originalState, {
				type: PLUGIN_INSTALL_REQUEST_SUCCESS,
				siteId: 'one.site',
				pluginId: jetpack.id,
				data: jetpack,
			} );
			expect( state ).to.eql( { 'one.site': [ akismet, jetpack ] } );
		} );

		test( 'should remove an existing plugin when deleted', () => {
			const originalState = deepFreeze( { 'one.site': [ akismet, jetpack ] } );
			const state = plugins( originalState, {
				type: PLUGIN_REMOVE_REQUEST_SUCCESS,
				siteId: 'one.site',
				pluginId: jetpack.id,
			} );
			expect( state ).to.eql( { 'one.site': [ akismet ] } );
		} );
	} );

	describe( 'status', () => {
		test( 'should set a progress status entry when an action begins', () => {
			const originalState = deepFreeze( {} );
			const state = status( originalState, {
				type: PLUGIN_ACTIVATE_REQUEST,
				action: ACTIVATE_PLUGIN,
				siteId: 'one.site',
				pluginId: akismet.id,
			} );
			expect( state ).to.eql( {
				'one.site': {
					[ akismet.id ]: {
						status: 'inProgress',
						action: ACTIVATE_PLUGIN,
					},
				},
			} );
		} );

		test( 'should set a successful status entry for a successful action', () => {
			const originalState = deepFreeze( {
				'one.site': {
					[ akismet.id ]: {
						status: 'inProgress',
						action: ACTIVATE_PLUGIN,
					},
				},
			} );
			const state = status( originalState, {
				type: PLUGIN_ACTIVATE_REQUEST_SUCCESS,
				action: ACTIVATE_PLUGIN,
				siteId: 'one.site',
				pluginId: akismet.id,
				data: Object.assign( {}, akismet, { active: true } ),
			} );
			expect( state ).to.eql( {
				'one.site': {
					[ akismet.id ]: {
						status: 'completed',
						action: ACTIVATE_PLUGIN,
					},
				},
			} );
		} );

		test( 'should set a error status entry for a failed action', () => {
			const originalState = deepFreeze( {} );
			const testError = new Error( 'Plugin file does not exist.' );
			testError.name = 'activation_error';
			const state = status( originalState, {
				type: PLUGIN_ACTIVATE_REQUEST_FAILURE,
				action: ACTIVATE_PLUGIN,
				siteId: 'one.site',
				pluginId: akismet.id,
				error: testError,
			} );
			expect( state ).to.eql( {
				'one.site': {
					[ akismet.id ]: {
						status: 'error',
						action: ACTIVATE_PLUGIN,
						error: testError,
					},
				},
			} );
		} );

		test( 'should delete all statuses of the specified types for all sites and plugins', () => {
			const originalState = deepFreeze( {
				'one.site': {
					[ akismet.id ]: {
						status: 'inProgress',
						action: ACTIVATE_PLUGIN,
					},
					[ jetpack.id ]: {
						status: 'error',
						action: ACTIVATE_PLUGIN,
					},
				},
				'another.site': {
					[ akismet.id ]: {
						status: 'completed',
						action: ACTIVATE_PLUGIN,
					},
				},
			} );
			const state = status( originalState, {
				type: PLUGIN_NOTICES_REMOVE,
				statuses: [ 'completed', 'error' ],
			} );
			expect( state ).to.eql( {
				'one.site': {
					[ akismet.id ]: {
						status: 'inProgress',
						action: ACTIVATE_PLUGIN,
					},
				},
			} );
		} );
	} );
} );
