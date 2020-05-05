/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { INSTALL_PLUGIN, DEACTIVATE_PLUGIN, ENABLE_AUTOUPDATE_PLUGIN } from '../constants';
import * as selectors from '../selectors';
import { akismet, helloDolly, jetpack } from './fixtures/plugins';
import { userState } from 'state/selectors/test/fixtures/user-state';

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
} );
