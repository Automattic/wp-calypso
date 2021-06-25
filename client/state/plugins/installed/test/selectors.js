/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import {
	DEACTIVATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	INSTALL_PLUGIN,
} from 'calypso/lib/plugins/constants';
import * as selectors from '../selectors';
import { akismet, helloDolly, jetpack } from './fixtures/plugins';
import { userState } from 'calypso/state/selectors/test/fixtures/user-state';
import { getSite } from 'calypso/state/sites/selectors';

const createError = function ( error, message, name = false ) {
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
			plugins: {
				'site.one': [ akismet, helloDolly ],
				'site.two': [ jetpack, helloDolly ],
			},
			status: {
				'site.one': {
					'akismet/akismet': {
						status: 'inProgress',
						action: ENABLE_AUTOUPDATE_PLUGIN,
					},
					'jetpack/jetpack': {
						status: 'completed',
						action: DEACTIVATE_PLUGIN,
					},
				},
				'site.two': {
					'akismet/akismet': {
						status: 'error',
						action: INSTALL_PLUGIN,
						error: createError( 'no_package', 'Download failed.' ),
					},
				},
			},
		},
	},
	sites: {
		items: {
			'site.one': {
				ID: 'site.one',
				jetpack: true,
				visible: true,
				name: 'One Site',
			},
			'site.two': {
				ID: 'site.two',
				jetpack: true,
				visible: true,
				name: 'Two Site',
			},
		},
	},
	...userState,
} );

describe( 'Installed plugin selectors', () => {
	test( 'should contain isRequesting method', () => {
		expect( selectors.isRequesting ).to.be.a( 'function' );
	} );

	test( 'should contain isRequestingForSites method', () => {
		expect( selectors.isRequestingForSites ).to.be.a( 'function' );
	} );

	test( 'should contain getPlugins method', () => {
		expect( selectors.getPlugins ).to.be.a( 'function' );
	} );

	test( 'should contain getPluginsWithUpdates method', () => {
		expect( selectors.getPluginsWithUpdates ).to.be.a( 'function' );
	} );

	test( 'should contain getPluginOnSite method', () => {
		expect( selectors.getPluginOnSite ).to.be.a( 'function' );
	} );

	test( 'should contain getSitesWithPlugin method', () => {
		expect( selectors.getSitesWithPlugin ).to.be.a( 'function' );
	} );

	test( 'should contain getSiteObjectsWithPlugin method', () => {
		expect( selectors.getSiteObjectsWithPlugin ).to.be.a( 'function' );
	} );

	test( 'should contain getSitesWithoutPlugin method', () => {
		expect( selectors.getSitesWithoutPlugin ).to.be.a( 'function' );
	} );

	test( 'should contain getLogsForPlugin method', () => {
		expect( selectors.getStatusForPlugin ).to.be.a( 'function' );
	} );

	test( 'should contain isPluginDoingAction method', () => {
		expect( selectors.isPluginDoingAction ).to.be.a( 'function' );
	} );

	describe( 'isRequesting', () => {
		test( 'Should get `false` if this site is not in the current state', () => {
			expect( selectors.isRequesting( state, 'no.site' ) ).to.be.false;
		} );

		test( 'Should get `false` if this site is not being fetched', () => {
			expect( selectors.isRequesting( state, 'site.one' ) ).to.be.false;
		} );

		test( 'Should get `true` if this site is being fetched', () => {
			expect( selectors.isRequesting( state, 'site.three' ) ).to.be.true;
		} );
	} );

	describe( 'isLoaded', () => {
		test( 'Should get `false` if this site is not in the current state', () => {
			expect( selectors.isLoaded( state, 'no.site' ) ).to.be.false;
		} );

		test( 'Should get `true` if this site is done being fetched', () => {
			expect( selectors.isLoaded( state, 'site.one' ) ).to.be.true;
		} );

		test( 'Should get `false` if this site is currently being fetched', () => {
			expect( selectors.isLoaded( state, 'site.three' ) ).to.be.false;
		} );
	} );

	describe( 'isRequestingForSites', () => {
		test( 'Should get `false` if no sites are being fetched', () => {
			expect( selectors.isRequestingForSites( state, [ 'site.one', 'site.two' ] ) ).to.be.false;
		} );

		test( 'Should get `true` if any site is being fetched', () => {
			expect( selectors.isRequestingForSites( state, [ 'site.one', 'site.three' ] ) ).to.be.true;
		} );

		test( 'Should get `true` if any site is being fetched, even if one is not in the current state', () => {
			expect( selectors.isRequestingForSites( state, [ 'no.site', 'site.three' ] ) ).to.be.true;
		} );

		test( 'Should get `false` if sites are not being fetched, including a site not in the current state', () => {
			expect( selectors.isRequestingForSites( state, [ 'no.site', 'site.two' ] ) ).to.be.false;
		} );
	} );

	describe( 'getPlugins', () => {
		test( 'Should get an empty array if the requested site is not in the current state', () => {
			const plugins = selectors.getPlugins( state, [ 'no.site' ] );
			expect( plugins ).to.have.lengthOf( 0 );
		} );

		test( 'Should get an empty array if the plugins for this site are still being requested', () => {
			const plugins = selectors.getPlugins( state, [ 'site.three' ] );
			expect( plugins ).to.have.lengthOf( 0 );
		} );

		test( 'Should get a plugin list of length 3 if both sites are requested', () => {
			const plugins = selectors.getPlugins( state, [ 'site.one', 'site.two' ] );
			expect( plugins ).to.have.lengthOf( 3 );
		} );

		test( 'Should get a plugin list containing jetpack if both sites are requested', () => {
			const siteOneId = 'site.one';
			const siteTwoId = 'site.two';
			const plugins = selectors.getPlugins( state, [ siteOneId, siteTwoId ] );
			const siteWithPlugin = {
				[ siteTwoId ]: pick( jetpack, [ 'active', 'autoupdate', 'update' ] ),
			};
			expect( plugins ).to.deep.include( { ...jetpack, sites: siteWithPlugin } );
		} );

		test( 'Should get a plugin list of length 2 if only site 1 is requested', () => {
			const plugins = selectors.getPlugins( state, [ 'site.one' ] );
			expect( plugins ).to.have.lengthOf( 2 );
		} );

		test( 'Should get a plugin list of length 2 if active plugins on both sites are requested', () => {
			const plugins = selectors.getPlugins( state, [ 'site.one', 'site.two' ], 'active' );
			expect( plugins ).to.have.lengthOf( 2 );
		} );

		test( 'Should get a plugin list of length 1 if inactive plugins on site 1 is requested', () => {
			const plugins = selectors.getPlugins( state, [ 'site.one' ], 'inactive' );
			expect( plugins ).to.have.lengthOf( 1 );
		} );
	} );

	describe( 'getPluginsWithUpdates', () => {
		test( 'Should get an empty array if the requested site is not in the current state', () => {
			const plugins = selectors.getPluginsWithUpdates( state, [ 'no.site' ] );
			expect( plugins ).to.have.lengthOf( 0 );
		} );

		test( 'Should get a plugin list of length 1 when we can update files on the site', () => {
			const plugins = selectors.getPluginsWithUpdates( state, [ 'site.one', 'site.two' ] );
			expect( plugins ).to.have.lengthOf( 1 );
		} );
	} );

	describe( 'getPluginOnSite', () => {
		test( 'Should get an undefined value if the requested site is not in the current state', () => {
			expect( selectors.getPluginOnSite( state, 'no.site', 'akismet' ) ).to.be.undefined;
		} );

		test( 'Should get an undefined value if the requested plugin on this site is not in the current state', () => {
			expect( selectors.getPluginOnSite( state, 'site.one', 'jetpack' ) ).to.be.undefined;
		} );

		test( 'Should get the plugin if the it exists on the requested site', () => {
			const siteOneId = 'site.one';
			const plugin = selectors.getPluginOnSite( state, siteOneId, 'akismet' );
			const siteWithPlugin = {
				[ siteOneId ]: pick( akismet, [ 'active', 'autoupdate', 'update' ] ),
			};
			expect( plugin ).to.eql( { ...akismet, sites: siteWithPlugin } );
		} );
	} );

	describe( 'getPluginOnSites', () => {
		test( 'Should get an undefined value if the requested sites are not in the current state', () => {
			const siteIds = [ 'no.site', 'some.site' ];
			expect( selectors.getPluginOnSites( state, siteIds, 'akismet' ) ).to.be.undefined;
		} );

		test( 'Should get an undefined value if the requested plugin on these sites is not in the current state', () => {
			expect( selectors.getPluginOnSites( state, [ 'site.one' ], 'jetpack' ) ).to.be.undefined;
		} );

		test( 'Should get the plugin if the it exists on one or more of the requested sites', () => {
			const siteIds = [ 'site.one', 'site.two' ];
			const plugin = selectors.getPluginOnSites( state, siteIds, 'hello-dolly' );
			const sitesWithPlugins = {
				[ 'site.one' ]: pick( helloDolly, [ 'active', 'autoupdate', 'update' ] ),
				[ 'site.two' ]: pick( helloDolly, [ 'active', 'autoupdate', 'update' ] ),
			};
			expect( plugin ).to.eql( { ...helloDolly, sites: sitesWithPlugins } );
		} );
	} );

	describe( 'getSitesWithPlugin', () => {
		test( 'Should get an empty array if the requested site is not in the current state', () => {
			expect( selectors.getSitesWithPlugin( state, [ 'no.site' ], 'akismet' ) ).to.have.lengthOf(
				0
			);
		} );

		test( "Should get an empty array if the requested plugin doesn't exist on any sites' state", () => {
			expect(
				selectors.getSitesWithPlugin( state, [ 'site.one', 'site.two' ], 'vaultpress' )
			).to.have.lengthOf( 0 );
		} );

		test( 'Should get an array of sites with the requested plugin', () => {
			const siteIds = selectors.getSitesWithPlugin( state, [ 'site.one', 'site.two' ], 'jetpack' );
			expect( siteIds ).to.eql( [ 'site.two' ] );
		} );
	} );

	describe( 'getSiteObjectsWithPlugin', () => {
		test( 'Should get an empty array if the requested site is not in the current state', () => {
			expect(
				selectors.getSiteObjectsWithPlugin( state, [ 'no.site' ], 'akismet' )
			).to.have.lengthOf( 0 );
		} );

		test( "Should get an empty array if the requested plugin doesn't exist on any sites' state", () => {
			expect(
				selectors.getSiteObjectsWithPlugin( state, [ 'site.one', 'site.two' ], 'vaultpress' )
			).to.have.lengthOf( 0 );
		} );

		test( 'Should get an array of sites with the requested plugin', () => {
			const siteIds = selectors.getSiteObjectsWithPlugin(
				state,
				[ 'site.one', 'site.two' ],
				'jetpack'
			);
			expect( siteIds ).to.eql( [ getSite( state, 'site.two' ) ] );
		} );
	} );

	describe( 'getSitesWithoutPlugin', () => {
		test( 'Should get an empty array if the requested site is not in the current state', () => {
			expect( selectors.getSitesWithoutPlugin( state, [ 'no.site' ], 'akismet' ) ).to.have.lengthOf(
				0
			);
		} );

		test( "Should get an array of sites that don't have the plugin in their state", () => {
			const siteIds = selectors.getSitesWithoutPlugin(
				state,
				[ 'site.one', 'site.two' ],
				'akismet'
			);
			expect( siteIds ).to.eql( [ 'site.two' ] );
		} );

		test( 'Should get an empty array if the requested plugin exists on all requested sites', () => {
			const siteIds = selectors.getSitesWithoutPlugin(
				state,
				[ 'site.one', 'site.two' ],
				'hello-dolly'
			);
			expect( siteIds ).to.have.lengthOf( 0 );
		} );
	} );

	describe( 'getStatusForPlugin', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			expect( selectors.getStatusForPlugin( state, 'no.site', 'akismet/akismet' ) ).to.be.false;
		} );

		test( 'Should get `false` if the requested plugin on this site is not in the current state', () => {
			expect( selectors.getStatusForPlugin( state, 'site.one', 'hello-dolly/hello' ) ).to.be.false;
		} );

		test( 'Should get the log if the requested site & plugin have logs', () => {
			expect( selectors.getStatusForPlugin( state, 'site.one', 'akismet/akismet' ) ).to.eql( {
				status: 'inProgress',
				siteId: 'site.one',
				pluginId: 'akismet/akismet',
				action: ENABLE_AUTOUPDATE_PLUGIN,
			} );
		} );
	} );

	describe( 'isPluginDoingAction', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			expect( selectors.isPluginDoingAction( state, 'no.site', 'akismet/akismet' ) ).to.be.false;
		} );

		test( 'Should get `false` if the requested site is finished with an action', () => {
			expect( selectors.isPluginDoingAction( state, 'site.one', 'jetpack/jetpack' ) ).to.be.false;
		} );

		test( 'Should get `true` if the requested site is doing an action', () => {
			expect( selectors.isPluginDoingAction( state, 'site.one', 'akismet/akismet' ) ).to.be.true;
		} );

		test( 'Should get `false` if the requested site had an error', () => {
			expect( selectors.isPluginDoingAction( state, 'site.two', 'akismet/akismet' ) ).to.be.false;
		} );
	} );

	describe( 'isPluginActionStatus', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			expect(
				selectors.isPluginActionStatus(
					state,
					'no.site',
					'jetpack/jetpack',
					DEACTIVATE_PLUGIN,
					'completed'
				)
			).to.be.false;
		} );

		test( 'Should get `false` if the plugin status for the action does not exist.', () => {
			expect(
				selectors.isPluginActionStatus(
					state,
					'site.one',
					'jetpack/jetpack',
					INSTALL_PLUGIN,
					'completed'
				)
			).to.be.false;
		} );

		test( 'Should get `false` if the plugin status for the action does not match the status.', () => {
			expect(
				selectors.isPluginActionStatus(
					state,
					'site.one',
					'jetpack/jetpack',
					DEACTIVATE_PLUGIN,
					'inProgress'
				)
			).to.be.false;
		} );

		test( 'Should get `false` if the plugin status for none of the actions matches the status.', () => {
			expect(
				selectors.isPluginActionStatus(
					state,
					'site.one',
					'jetpack/jetpack',
					[ INSTALL_PLUGIN, ENABLE_AUTOUPDATE_PLUGIN ],
					'completed'
				)
			).to.be.false;
		} );

		test( 'Should get `true` if the plugin status for the action matches the status.', () => {
			expect(
				selectors.isPluginActionStatus(
					state,
					'site.one',
					'jetpack/jetpack',
					DEACTIVATE_PLUGIN,
					'completed'
				)
			).to.be.true;
		} );

		test( 'Should get `true` if the plugin status for one of the actions matches the status.', () => {
			expect(
				selectors.isPluginActionStatus(
					state,
					'site.one',
					'jetpack/jetpack',
					[ INSTALL_PLUGIN, DEACTIVATE_PLUGIN ],
					'completed'
				)
			).to.be.true;
		} );
	} );

	describe( 'isPluginActionInProgress', () => {
		test( 'Should get `false` if the plugin status for the action is not "inProgress".', () => {
			expect(
				selectors.isPluginActionInProgress(
					state,
					'site.one',
					'jetpack/jetpack',
					DEACTIVATE_PLUGIN
				)
			).to.be.false;
		} );

		test( 'Should get `true` if the plugin status for the action is "inProgress".', () => {
			expect(
				selectors.isPluginActionInProgress(
					state,
					'site.one',
					'akismet/akismet',
					ENABLE_AUTOUPDATE_PLUGIN
				)
			).to.be.true;
		} );
	} );

	describe( 'getPluginStatusesByType', () => {
		test( 'Should return a list of all plugin statuses, and add siteId and pluginId to each status.', () => {
			expect( selectors.getPluginStatusesByType( state, 'completed' ) ).to.deep.equal( [
				{
					siteId: 'site.one',
					pluginId: 'jetpack/jetpack',
					action: DEACTIVATE_PLUGIN,
					status: 'completed',
				},
			] );
		} );

		test( 'Should return an empty array if there are no matching statuses of that type.', () => {
			expect( selectors.getPluginStatusesByType( state, 'someOtherType' ) ).to.eql( [] );
		} );
	} );
} );
