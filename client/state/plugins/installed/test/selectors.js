/* eslint-disable max-len */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import selectors from '../selectors';
import { akismet, helloDolly, jetpack } from './plugins';
import {
	INSTALL_PLUGIN,
	DEACTIVATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
} from '../constants';

const createError = function( error, message, name = false ) {
	const errorObj = new Error( message );
	errorObj.error = error;
	errorObj.name = name || error;
	return errorObj;
};

const state = deepFreeze( {
	plugins: {
		installed: {
			isRequesting: {
				'site.one': false,
				'site.two': false,
				'site.three': true,
			},
			hasRequested: {
				'site.one': true,
				'site.two': true,
				'site.three': true,
			},
			plugins: {
				'site.one': [ akismet, helloDolly ],
				'site.two': [ jetpack ],
			},
			logs: {
				'site.one': {
					'akismet/akismet': {
						status: 'inProgress',
						action: ENABLE_AUTOUPDATE_PLUGIN,
					},
					'jetpack/jetpack': {
						status: 'completed',
						action: DEACTIVATE_PLUGIN,
					}
				},
				'site.two': {
					'akismet/akismet': {
						status: 'error',
						action: INSTALL_PLUGIN,
						error: createError( 'no_package', 'Download failed.' ),
					}
				}
			}
		}
	}
} );

describe( 'Installed plugin selectors', function() {
	it( 'should contain isRequesting method', function() {
		expect( selectors.isRequesting ).to.be.a( 'function' );
	} );

	it( 'should contain hasRequested method', function() {
		expect( selectors.hasRequested ).to.be.a( 'function' );
	} );

	it( 'should contain getPlugins method', function() {
		expect( selectors.getPlugins ).to.be.a( 'function' );
	} );

	it( 'should contain getPluginsWithUpdates method', function() {
		expect( selectors.getPluginsWithUpdates ).to.be.a( 'function' );
	} );

	it( 'should contain getLogsForPlugin method', function() {
		expect( selectors.getLogsForPlugin ).to.be.a( 'function' );
	} );

	it( 'should contain isPluginDoingAction method', function() {
		expect( selectors.isPluginDoingAction ).to.be.a( 'function' );
	} );

	describe( 'isRequesting', function() {
		it( 'Should get `true` if the requested site is not in the current state', function() {
			expect( selectors.isRequesting( state, 'no.site' ) ).to.be.true;
		} );

		it( 'Should get `false` if the requested site is not being fetched', function() {
			expect( selectors.isRequesting( state, 'site.one' ) ).to.be.false;
		} );

		it( 'Should get `true` if the requested site is being fetched', function() {
			expect( selectors.isRequesting( state, 'site.three' ) ).to.be.true;
		} );
	} );

	describe( 'hasRequested', function() {
		it( 'Should get `false` if the requested site is not in the current state', function() {
			expect( selectors.hasRequested( state, 'no.site' ) ).to.be.false;
		} );

		it( 'Should get `true` if the requested site is has already been fetched', function() {
			expect( selectors.hasRequested( state, 'site.one' ) ).to.be.true;
		} );

		it( 'Should get `true` if the requested site is being fetched', function() {
			expect( selectors.hasRequested( state, 'site.three' ) ).to.be.true;
		} );
	} );

	describe( 'getPlugins', function() {
		it( 'Should get an empty array if the requested site is not in the current state', function() {
			const plugins = selectors.getPlugins( state, [ { ID: 'no.site' } ] );
			expect( plugins ).to.have.lengthOf( 0 );
		} );

		it( 'Should get a plugin list of length 3 if both sites are requested', function() {
			const plugins = selectors.getPlugins( state, [ { ID: 'site.one' }, { ID: 'site.two' } ] );
			expect( plugins ).to.have.lengthOf( 3 );
		} );

		it( 'Should get a plugin list containing jetpack if both sites are requested', function() {
			const siteOneObj = { ID: 'site.one' };
			const siteTwoObj = { ID: 'site.two' };
			const plugins = selectors.getPlugins( state, [ siteOneObj, siteTwoObj ] );
			const siteTwoWithPlugin = Object.assign( {}, siteTwoObj, { plugin: jetpack } );
			const jetpackWithSite = Object.assign( {}, jetpack, { sites: [ siteTwoWithPlugin ] } );
			expect( plugins ).to.deep.include( jetpackWithSite );
		} );

		it( 'Should get a plugin list of length 2 if only site 1 is requested', function() {
			const plugins = selectors.getPlugins( state, [ { ID: 'site.one' } ] );
			expect( plugins ).to.have.lengthOf( 2 );
		} );

		it( 'Should get a plugin list of length 2 if active plugins on both sites are requested', function() {
			const plugins = selectors.getPlugins( state, [ { ID: 'site.one' }, { ID: 'site.two' } ], 'active' );
			expect( plugins ).to.have.lengthOf( 2 );
		} );

		it( 'Should get a plugin list of length 1 if inactive plugins on site 1 is requested', function() {
			const plugins = selectors.getPlugins( state, [ { ID: 'site.one' } ], 'inactive' );
			expect( plugins ).to.have.lengthOf( 1 );
		} );
	} );

	describe( 'getPluginsWithUpdates', function() {
		it( 'Should get an empty array if the requested site is not in the current state', function() {
			const plugins = selectors.getPluginsWithUpdates( state, [ { ID: 'no.site' } ] );
			expect( plugins ).to.have.lengthOf( 0 );
		} );

		it( 'Should get a plugin list of length 1 when we can update files on the site', function() {
			const plugins = selectors.getPluginsWithUpdates( state, [ {
				ID: 'site.one',
				canUpdateFiles: true
			}, {
				ID: 'site.two',
				canUpdateFiles: true
			} ] );
			expect( plugins ).to.have.lengthOf( 1 );
		} );

		it( 'Should get a plugin list of length 0 when we cannot update files on the site', function() {
			const plugins = selectors.getPluginsWithUpdates( state, [ {
				ID: 'site.one',
				canUpdateFiles: false
			}, {
				ID: 'site.two',
				canUpdateFiles: false
			} ] );
			expect( plugins ).to.have.lengthOf( 0 );
		} );
	} );

	describe( 'getPluginOnSite', function() {
		it( 'Should get `false` if the requested site is not in the current state', function() {
			expect( selectors.getPluginOnSite( state, { ID: 'no.site' }, 'akismet/akismet' ) ).to.be.false;
		} );

		it( 'Should get `false` if the requested plugin on this site is not in the current state', function() {
			expect( selectors.getPluginOnSite( state, { ID: 'site.one' }, 'jetpack/jetpack' ) ).to.be.false;
		} );

		it( 'Should get the plugin if the it exists on the requested site', function() {
			const siteOneObj = { ID: 'site.one' };
			const plugin = selectors.getPluginOnSite( state, siteOneObj, 'akismet/akismet' );
			const siteOneWithPlugin = Object.assign( {}, siteOneObj, { plugin: akismet } );
			const akismetWithSite = Object.assign( {}, akismet, { sites: [ siteOneWithPlugin ] } );
			expect( plugin ).to.eql( akismetWithSite );
		} );
	} );

	describe( 'getLogsForPlugin', function() {
		it( 'Should get `false` if the requested site is not in the current state', function() {
			expect( selectors.getLogsForPlugin( state, 'no.site', 'akismet/akismet' ) ).to.be.false;
		} );

		it( 'Should get `false` if the requested plugin on this site is not in the current state', function() {
			expect( selectors.getLogsForPlugin( state, 'site.one', 'hello-dolly/hello' ) ).to.be.false;
		} );

		it( 'Should get the log if the requested site & plugin have logs', function() {
			expect( selectors.getLogsForPlugin( state, 'site.one', 'akismet/akismet' ) ).to.eql( {
				status: 'inProgress',
				siteId: 'site.one',
				pluginId: 'akismet/akismet',
				action: ENABLE_AUTOUPDATE_PLUGIN,
			} );
		} );
	} );

	describe( 'isPluginDoingAction', function() {
		it( 'Should get `false` if the requested site is not in the current state', function() {
			expect( selectors.isPluginDoingAction( state, 'no.site', 'akismet/akismet' ) ).to.be.false;
		} );

		it( 'Should get `false` if the requested site is finished with an action', function() {
			expect( selectors.isPluginDoingAction( state, 'site.one', 'jetpack/jetpack' ) ).to.be.false;
		} );

		it( 'Should get `true` if the requested site is doing an action', function() {
			expect( selectors.isPluginDoingAction( state, 'site.one', 'akismet/akismet' ) ).to.be.true;
		} );

		it( 'Should get `false` if the requested site had an error', function() {
			expect( selectors.isPluginDoingAction( state, 'site.two', 'akismet/akismet' ) ).to.be.false;
		} );
	} );
} );
