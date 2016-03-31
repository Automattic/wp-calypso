/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	PLUGIN_SETUP_FETCH_INSTRUCTIONS,
	PLUGIN_SETUP_RECEIVE_INSTRUCTIONS,
	PLUGIN_SETUP_INSTALL,
	PLUGIN_SETUP_ACTIVATE,
	PLUGIN_SETUP_CONFIGURE,
	PLUGIN_SETUP_FINISH,
	PLUGIN_SETUP_ERROR
} from 'state/action-types';

import { isRequesting, plugins } from '../reducer';

const initSite = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: {
			start: false,
			install: null,
			activate: null,
			config: null,
			done: false,
		},
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: {
			start: false,
			install: null,
			activate: null,
			config: null,
			done: false,
		},
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: {
			start: false,
			install: null,
			activate: null,
			config: null,
			done: false,
		},
		error: null
	}
];

const installingSite = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: {
			start: false,
			install: false,
			activate: false,
			config: false,
			done: true,
		},
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: {
			start: true,
			install: true,
			activate: null,
			config: null,
			done: false,
		},
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: {
			start: false,
			install: null,
			activate: null,
			config: null,
			done: false,
		},
		error: null
	}
];

const activatingSite = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: {
			start: false,
			install: false,
			activate: false,
			config: false,
			done: true,
		},
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: {
			start: true,
			install: false,
			activate: true,
			config: null,
			done: false,
		},
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: {
			start: false,
			install: null,
			activate: null,
			config: null,
			done: false,
		},
		error: null
	}
];

const configuringSite = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: {
			start: false,
			install: false,
			activate: false,
			config: false,
			done: true,
		},
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: {
			start: true,
			install: false,
			activate: false,
			config: true,
			done: false,
		},
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: {
			start: false,
			install: null,
			activate: null,
			config: null,
			done: false,
		},
		error: null
	}
];

const finishedSite = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: {
			start: false,
			install: false,
			activate: false,
			config: false,
			done: true,
		},
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: {
			start: true,
			install: false,
			activate: false,
			config: false,
			done: true,
		},
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: {
			start: false,
			install: null,
			activate: null,
			config: null,
			done: false,
		},
		error: null
	}
];

const finishedSiteWithError = [
	{
		slug: 'vaultpress',
		name: 'VaultPress',
		key: 'vp-api-key',
		status: {
			start: false,
			install: false,
			activate: false,
			config: false,
			done: true,
		},
		error: null
	}, {
		slug: 'akismet',
		name: 'Akismet',
		key: 'ak-api-key',
		status: {
			start: false,
			install: false,
			activate: false,
			config: false,
			done: true,
		},
		error: null
	}, {
		slug: 'polldaddy',
		name: 'Polldaddy',
		key: 'pd-api-key',
		status: {
			start: false,
			install: false,
			activate: true,
			config: null,
			done: false,
		},
		error: { name: 'ErrorCode', message: 'Something went wrong.' }
	}
]

describe.only( 'premium reducer', () => {
	describe( 'isRequesting', () => {
		it( 'should track when fetches start', () => {
			const state = isRequesting( undefined, {
				type: PLUGIN_SETUP_FETCH_INSTRUCTIONS,
				siteId: 'one.site'
			} );
			expect( state ).to.deep.equal( { 'one.site': true } );
		} );
		it( 'keeps track of multiple sites', () => {
			const originalState = deepFreeze( { 'one.site': true } );
			const state = isRequesting( originalState, {
				type: PLUGIN_SETUP_FETCH_INSTRUCTIONS,
				siteId: 'two.site'
			} );
			expect( state ).to.deep.equal( { 'one.site': true, 'two.site': true } );
		} );
		it( 'should track when fetches end', () => {
			const originalState = deepFreeze( { 'one.site': true } );
			const state = isRequesting( originalState, {
				type: PLUGIN_SETUP_RECEIVE_INSTRUCTIONS,
				siteId: 'one.site'
			} );
			expect( state ).to.deep.equal( { 'one.site': false } );
		} );
		it( 'should track when fetches end for many sites', () => {
			const originalState = deepFreeze( { 'one.site': true } );
			const state = isRequesting( originalState, {
				type: PLUGIN_SETUP_RECEIVE_INSTRUCTIONS,
				siteId: 'two.site'
			} );
			expect( state ).to.deep.equal( { 'one.site': true, 'two.site': false } );
		} );
		it( 'should not change when plugin status updates', () => {
			const originalState = deepFreeze( { 'one.site': false } );
			const state = isRequesting( originalState, {
				type: PLUGIN_SETUP_INSTALL,
				siteId: 'one.site'
			} );
			expect( state ).to.deep.equal( originalState );
		} );
	} );

	describe( 'plugins', () => {
		it( 'should load the install instructions', () => {
			const originalState = deepFreeze( { 'one.site': [] } );
			const state = plugins( originalState, {
				type: PLUGIN_SETUP_RECEIVE_INSTRUCTIONS,
				siteId: 'one.site',
				data: initSite
			} );
			expect( state ).to.deep.equal( { 'one.site': initSite } );
		} );

		it( 'should keep track of install instructions for multiple sites', () => {
			const originalState = deepFreeze( { 'one.site': installingSite } );
			const state = plugins( originalState, {
				type: PLUGIN_SETUP_RECEIVE_INSTRUCTIONS,
				siteId: 'two.site',
				data: initSite
			} );
			expect( state ).to.deep.equal( { 'one.site': installingSite, 'two.site': initSite } );
		} );

		it( 'should track when a plugin has started installing', () => {
			const originalState = deepFreeze( { 'one.site': initSite } );
			const state = plugins( originalState, {
				type: PLUGIN_SETUP_INSTALL,
				siteId: 'one.site',
				slug: 'vaultpress',
			} );
			expect( state ).to.deep.equal( { 'one.site': [
				{
					slug: 'vaultpress',
					name: 'VaultPress',
					key: 'vp-api-key',
					status: {
						start: true,
						install: true,
						activate: null,
						config: null,
						done: false,
					},
					error: null
				}, {
					slug: 'akismet',
					name: 'Akismet',
					key: 'ak-api-key',
					status: {
						start: false,
						install: null,
						activate: null,
						config: null,
						done: false,
					},
					error: null
				}, {
					slug: 'polldaddy',
					name: 'Polldaddy',
					key: 'pd-api-key',
					status: {
						start: false,
						install: null,
						activate: null,
						config: null,
						done: false,
					},
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
			expect( state ).to.deep.equal( { 'one.site': activatingSite } );
		} );

		it( 'should track when a plugin is being configured', () => {
			const originalState = deepFreeze( { 'one.site': activatingSite } );
			const state = plugins( originalState, {
				type: PLUGIN_SETUP_CONFIGURE,
				siteId: 'one.site',
				slug: 'akismet',
			} );
			expect( state ).to.deep.equal( { 'one.site': configuringSite } );
		} );

		it( 'should track when a plugin has successfully finished', () => {
			const originalState = deepFreeze( { 'one.site': configuringSite } );
			const state = plugins( originalState, {
				type: PLUGIN_SETUP_FINISH,
				siteId: 'one.site',
				slug: 'akismet',
			} );
			expect( state ).to.deep.equal( { 'one.site': finishedSite } );
		} );

		it( 'should track any errors when installing a plugin', () => {
			const originalState = deepFreeze( { 'one.site': [
				{
					slug: 'vaultpress',
					name: 'VaultPress',
					key: 'vp-api-key',
					status: {
						start: false,
						install: false,
						activate: false,
						config: false,
						done: true,
					},
					error: null
				}, {
					slug: 'akismet',
					name: 'Akismet',
					key: 'ak-api-key',
					status: {
						start: false,
						install: false,
						activate: false,
						config: false,
						done: true,
					},
					error: null
				}, {
					slug: 'polldaddy',
					name: 'Polldaddy',
					key: 'pd-api-key',
					status: {
						start: true,
						install: false,
						activate: true,
						config: null,
						done: false,
					},
					error: null
				}
			] } );
			const state = plugins( originalState, {
				type: PLUGIN_SETUP_ERROR,
				siteId: 'one.site',
				slug: 'polldaddy',
				error: { name: 'ErrorCode', message: 'Something went wrong.' }
			} );
			expect( state ).to.deep.equal( { 'one.site': finishedSiteWithError } );
		} );
	} );
} );
