import deepFreeze from 'deep-freeze';
import { PLUGIN_SETUP_INSTRUCTIONS_RECEIVE } from 'calypso/state/action-types';
import { serialize } from 'calypso/state/utils';
import { hasRequested, plugins } from '../reducer';
import { initSite, installingSite } from './examples';

describe( 'premium reducer', () => {
	describe( 'hasRequested', () => {
		test( 'should track when fetches end', () => {
			const state = hasRequested( undefined, {
				type: PLUGIN_SETUP_INSTRUCTIONS_RECEIVE,
				siteId: 'one.site',
			} );
			expect( state ).toEqual( { 'one.site': true } );
		} );

		test( 'keeps track of multiple sites', () => {
			const originalState = deepFreeze( { 'one.site': true } );
			const state = hasRequested( originalState, {
				type: PLUGIN_SETUP_INSTRUCTIONS_RECEIVE,
				siteId: 'two.site',
			} );
			expect( state ).toEqual( { 'one.site': true, 'two.site': true } );
		} );
	} );

	describe( 'plugins', () => {
		test( 'should load the install instructions', () => {
			const originalState = deepFreeze( { 'one.site': [] } );
			const state = plugins( originalState, {
				type: PLUGIN_SETUP_INSTRUCTIONS_RECEIVE,
				siteId: 'one.site',
				data: initSite,
			} );
			expect( state ).toEqual( { 'one.site': initSite } );
		} );

		test( 'should keep track of install instructions for multiple sites', () => {
			const originalState = deepFreeze( { 'one.site': installingSite } );
			const state = plugins( originalState, {
				type: PLUGIN_SETUP_INSTRUCTIONS_RECEIVE,
				siteId: 'two.site',
				data: initSite,
			} );
			expect( state ).toEqual( { 'one.site': installingSite, 'two.site': initSite } );
		} );

		test( 'should serialize state omitting the key', () => {
			const originalState = deepFreeze( {
				'one.site': [
					{
						slug: 'vaultpress',
						name: 'VaultPress',
						key: 'vp-api-key',
						status: 'wait',
						error: null,
					},
				],
			} );

			const nextState = serialize( plugins, originalState );
			expect( nextState ).toEqual( {
				'one.site': [
					{
						slug: 'vaultpress',
						name: 'VaultPress',
						/* key is ommited: (key: 'vp-api-key',) */
						status: 'wait',
						error: null,
					},
				],
			} );
		} );
	} );
} );
