/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	PLUGIN_SETUP_INSTRUCTIONS_FETCH,
	PLUGIN_SETUP_INSTRUCTIONS_RECEIVE,
	PLUGIN_SETUP_INSTALL,
	PLUGIN_SETUP_ACTIVATE,
	PLUGIN_SETUP_CONFIGURE,
	PLUGIN_SETUP_FINISH,
	PLUGIN_SETUP_ERROR
} from 'state/action-types';
import { isRequesting, plugins } from '../reducer';

// Example state data
import { initSite, installingSite, activatingSite, configuringSite, finishedPluginSite, siteWithError } from './examples';

describe( 'premium reducer', () => {
	describe( 'isRequesting', () => {
		it( 'should track when fetches start', () => {
			const state = isRequesting( undefined, {
				type: PLUGIN_SETUP_INSTRUCTIONS_FETCH,
				siteId: 'one.site'
			} );
			expect( state ).to.eql( { 'one.site': true } );
		} );
		it( 'keeps track of multiple sites', () => {
			const originalState = deepFreeze( { 'one.site': true } );
			const state = isRequesting( originalState, {
				type: PLUGIN_SETUP_INSTRUCTIONS_FETCH,
				siteId: 'two.site'
			} );
			expect( state ).to.eql( { 'one.site': true, 'two.site': true } );
		} );
		it( 'should track when fetches end', () => {
			const originalState = deepFreeze( { 'one.site': true } );
			const state = isRequesting( originalState, {
				type: PLUGIN_SETUP_INSTRUCTIONS_RECEIVE,
				siteId: 'one.site'
			} );
			expect( state ).to.eql( { 'one.site': false } );
		} );
		it( 'should track when fetches end for many sites', () => {
			const originalState = deepFreeze( { 'one.site': true } );
			const state = isRequesting( originalState, {
				type: PLUGIN_SETUP_INSTRUCTIONS_RECEIVE,
				siteId: 'two.site'
			} );
			expect( state ).to.eql( { 'one.site': true, 'two.site': false } );
		} );
		it( 'should not change when plugin status updates', () => {
			const originalState = deepFreeze( { 'one.site': false } );
			const state = isRequesting( originalState, {
				type: PLUGIN_SETUP_INSTALL,
				siteId: 'one.site'
			} );
			expect( state ).to.eql( originalState );
		} );
	} );

	describe( 'plugins', () => {
		it( 'should load the install instructions', () => {
			const originalState = deepFreeze( { 'one.site': [] } );
			const state = plugins( originalState, {
				type: PLUGIN_SETUP_INSTRUCTIONS_RECEIVE,
				siteId: 'one.site',
				data: initSite
			} );
			expect( state ).to.eql( { 'one.site': initSite } );
		} );

		it( 'should keep track of install instructions for multiple sites', () => {
			const originalState = deepFreeze( { 'one.site': installingSite } );
			const state = plugins( originalState, {
				type: PLUGIN_SETUP_INSTRUCTIONS_RECEIVE,
				siteId: 'two.site',
				data: initSite
			} );
			expect( state ).to.eql( { 'one.site': installingSite, 'two.site': initSite } );
		} );

		it( 'should track when a plugin has started installing', () => {
			const originalState = deepFreeze( { 'one.site': initSite } );
			const state = plugins( originalState, {
				type: PLUGIN_SETUP_INSTALL,
				siteId: 'one.site',
				slug: 'vaultpress',
			} );
			expect( state ).to.eql( { 'one.site': [
				{
					slug: 'vaultpress',
					name: 'VaultPress',
					key: 'vp-api-key',
					status: 'install',
					error: null
				}, {
					slug: 'akismet',
					name: 'Akismet',
					key: 'ak-api-key',
					status: 'wait',
					error: null
				}, {
					slug: 'polldaddy',
					name: 'Polldaddy',
					key: 'pd-api-key',
					status: 'wait',
					error: null
				}
			] } );
		} );

		it( 'should track when a plugin is being activated', () => {
			const originalState = deepFreeze( { 'one.site': installingSite } );
			const state = plugins( originalState, {
				type: PLUGIN_SETUP_ACTIVATE,
				siteId: 'one.site',
				slug: 'akismet',
			} );
			expect( state ).to.eql( { 'one.site': activatingSite } );
		} );

		it( 'should track when a plugin is being configured', () => {
			const originalState = deepFreeze( { 'one.site': activatingSite } );
			const state = plugins( originalState, {
				type: PLUGIN_SETUP_CONFIGURE,
				siteId: 'one.site',
				slug: 'akismet',
			} );
			expect( state ).to.eql( { 'one.site': configuringSite } );
		} );

		it( 'should track when a plugin has successfully finished', () => {
			const originalState = deepFreeze( { 'one.site': configuringSite } );
			const state = plugins( originalState, {
				type: PLUGIN_SETUP_FINISH,
				siteId: 'one.site',
				slug: 'akismet',
			} );
			expect( state ).to.eql( { 'one.site': finishedPluginSite } );
		} );

		it( 'should track any errors when installing a plugin', () => {
			const originalState = deepFreeze( { 'one.site': [
				{
					slug: 'vaultpress',
					name: 'VaultPress',
					key: 'vp-api-key',
					status: 'done',
					error: null
				}, {
					slug: 'akismet',
					name: 'Akismet',
					key: 'ak-api-key',
					status: 'done',
					error: null
				}, {
					slug: 'polldaddy',
					name: 'Polldaddy',
					key: 'pd-api-key',
					status: 'activate',
					error: null
				}
			] } );
			const state = plugins( originalState, {
				type: PLUGIN_SETUP_ERROR,
				siteId: 'one.site',
				slug: 'polldaddy',
				error: { name: 'ErrorCode', message: 'Something went wrong.' }
			} );
			expect( state ).to.eql( { 'one.site': siteWithError } );
		} );
	} );
} );
