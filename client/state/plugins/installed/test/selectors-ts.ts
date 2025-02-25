import deepFreeze from 'deep-freeze';
import {
	DEACTIVATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	INSTALL_PLUGIN,
} from 'calypso/lib/plugins/constants';
import { userState } from 'calypso/state/selectors/test/fixtures/user-state';
import { getSite } from 'calypso/state/sites/selectors';
import {
	getAllPluginsIndexedByPluginSlug,
	getAllPluginsIndexedBySiteId,
	getFilteredAndSortedPlugins,
	getPluginOnSite,
	getPluginOnSites,
	getPluginsOnSite,
	getPluginsWithUpdates,
	getSiteObjectsWithPlugin,
	getSitesWithPlugin,
	getSitesWithoutPlugin,
	isRequesting,
	isRequestingForSites,
	getStatusForPlugin,
	isPluginActionStatus,
	isPluginActionInProgress,
	getPluginStatusesByType,
	isPluginActive,
} from '../selectors-ts';
import { akismet, helloDolly, jetpack } from './fixtures/plugins';

const siteOneId = 12345;
const siteTwoId = 54321;
const siteThreeId = 21435;
const siteFourId = 54312;

const nonExistingSiteId1 = 0;
const nonExistingSiteId2 = 1;

const createError = function ( error, message, name = false ) {
	const errorObj = new Error( message );
	errorObj.name = name || error;
	return errorObj;
};

const state = deepFreeze( {
	plugins: {
		installed: {
			isRequesting: {
				[ siteOneId ]: false,
				[ siteTwoId ]: false,
				[ siteThreeId ]: true,
				[ siteFourId ]: false,
			},
			plugins: {
				[ siteOneId ]: [ akismet, helloDolly ],
				[ siteTwoId ]: [ jetpack, helloDolly ],
			},
			status: {
				[ siteOneId ]: {
					'akismet/akismet': {
						status: 'inProgress',
						action: ENABLE_AUTOUPDATE_PLUGIN,
					},
					'jetpack/jetpack': {
						status: 'completed',
						action: DEACTIVATE_PLUGIN,
					},
				},
				[ siteTwoId ]: {
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
			[ siteOneId ]: {
				ID: siteOneId,
				jetpack: true,
				visible: true,
				name: 'One Site',
			},
			[ siteTwoId ]: {
				ID: siteTwoId,
				jetpack: true,
				visible: true,
				name: 'Two Site',
			},
			[ siteFourId ]: {
				ID: siteFourId,
				jetpack: true,
				visible: true,
				name: 'Two Site',
			},
		},
	},
	...userState,
} );

const jetpackWithSites = deepFreeze( {
	id: 'jetpack/jetpack',
	slug: 'jetpack',
	name: 'Jetpack by WordPress.com',
	plugin_url: 'http://jetpack.com',
	description:
		'Bring the power of the WordPress.com cloud to your self-hosted WordPress. Jetpack enables you to connect your blog to a WordPress.com account to use the powerful features normally only available to WordPress.com users.',
	author: 'Automattic',
	author_url: 'http://jetpack.com',
	network: false,
	sites: {
		[ siteTwoId ]: {
			active: true,
			autoupdate: true,
			version: '4.1.1',
			update: {
				compatibility: {
					scalar: {
						scalar: false,
					},
				},
				id: '20101',
				new_version: '4.2.2',
				package: 'https://downloads.wordpress.org/plugin/jetpack.4.2.2.zip',
				plugin: 'jetpack/jetpack.php',
				slug: 'jetpack',
				tested: '4.6',
				url: 'https://wordpress.org/plugins/jetpack/',
			},
		},
	},
} );

const akismetWithSites = deepFreeze( {
	id: 'akismet/akismet',
	slug: 'akismet',
	name: 'Akismet',
	plugin_url: 'https://akismet.com/',
	description:
		'Used by millions, Akismet is quite possibly the best way in the world to <strong>protect your blog from spam</strong>. It keeps your site protected even while you sleep. To get started: 1) Click the "Activate" link to the left of this description, 2) <a href="https://akismet.com/get/">Sign up for an Akismet plan</a> to get an API key, and 3) Go to your Akismet configuration page, and save your API key.',
	author: 'Automattic',
	author_url: 'https://automattic.com/wordpress-plugins/',
	network: false,
	sites: {
		[ siteOneId ]: {
			active: true,
			autoupdate: true,
			version: '3.1.11',
		},
	},
} );

const helloDollyWithSites = deepFreeze( {
	id: 'hello-dolly/hello',
	slug: 'hello-dolly',
	name: 'Hello Dolly',
	plugin_url: 'https://wordpress.org/plugins/hello-dolly/',
	description:
		'This is not just a plugin, it symbolizes the hope and enthusiasm of an entire generation summed up in two words sung most famously by Louis Armstrong: Hello, Dolly. When activated you will randomly see a lyric from <cite>Hello, Dolly</cite> in the upper right of your admin screen on every page',
	author: 'Matt Mullenweg',
	author_url: 'http://ma.tt/',
	network: false,
	sites: {
		[ siteOneId ]: {
			active: false,
			version: '1.6',
			autoupdate: true,
		},
		[ siteTwoId ]: {
			active: false,
			version: '1.6',
			autoupdate: true,
		},
	},
} );

describe( 'isRequesting', () => {
	test( 'Should get `false` if this site is not in the current state', () => {
		expect( isRequesting( state, nonExistingSiteId1 ) ).toBe( false );
	} );

	test( 'Should get `false` if this site is not being fetched', () => {
		expect( isRequesting( state, siteOneId ) ).toBe( false );
	} );

	test( 'Should get `true` if this site is being fetched', () => {
		expect( isRequesting( state, siteThreeId ) ).toBe( true );
	} );
} );

describe( 'isRequestingForSites', () => {
	test( 'Should get `false` if no sites are being fetched', () => {
		expect( isRequestingForSites( state, [ siteOneId, siteTwoId ] ) ).toBe( false );
	} );

	test( 'Should get `true` if any site is being fetched', () => {
		expect( isRequestingForSites( state, [ siteOneId, siteThreeId ] ) ).toBe( true );
	} );

	test( 'Should get `true` if any site is being fetched, even if one is not in the current state', () => {
		expect( isRequestingForSites( state, [ nonExistingSiteId1, siteThreeId ] ) ).toBe( true );
	} );

	test( 'Should get `false` if sites are not being fetched, including a site not in the current state', () => {
		expect( isRequestingForSites( state, [ nonExistingSiteId1, siteTwoId ] ) ).toBe( false );
	} );
} );

describe( 'getAllPluginsIndexedByPluginSlug', () => {
	test( 'Returns the jetpack plugin', () => {
		const plugins = getAllPluginsIndexedByPluginSlug( state );

		expect( plugins[ 'jetpack' ] ).toEqual( jetpackWithSites );
	} );

	test( 'Returns the akismet plugin', () => {
		const plugins = getAllPluginsIndexedByPluginSlug( state );

		expect( plugins[ 'akismet' ] ).toEqual( akismetWithSites );
	} );

	test( 'Returns the hello-dolly plugin', () => {
		const plugins = getAllPluginsIndexedByPluginSlug( state );

		expect( plugins[ 'hello-dolly' ] ).toEqual( helloDollyWithSites );
	} );

	test( 'Returns undefined for a non-existing plugin', () => {
		const plugins = getAllPluginsIndexedByPluginSlug( state );

		expect( plugins[ 'none' ] ).toEqual( undefined );
	} );

	test( 'Memozies the returned plugins object', () => {
		const pluginsOne = getAllPluginsIndexedByPluginSlug( state );
		const pluginsTwo = getAllPluginsIndexedByPluginSlug( state );

		expect( pluginsOne ).toBe( pluginsTwo );
	} );
} );

describe( 'getAllPluginsIndexedBySiteId', () => {
	test( 'Returns the plugins for site one', () => {
		const plugins = getAllPluginsIndexedBySiteId( state );

		expect( plugins[ siteOneId ] ).toEqual( {
			akismet: akismetWithSites,
			'hello-dolly': helloDollyWithSites,
		} );
	} );

	test( 'Returns the plugins for site two.', () => {
		const plugins = getAllPluginsIndexedBySiteId( state );

		expect( plugins[ siteTwoId ] ).toEqual( {
			jetpack: jetpackWithSites,
			'hello-dolly': helloDollyWithSites,
		} );
	} );

	test( 'Returns undefined for a non-existing site.', () => {
		const plugins = getAllPluginsIndexedBySiteId( state );

		expect( plugins[ nonExistingSiteId1 ] ).toEqual( undefined );
	} );

	test( 'Memozies the returned plugins object', () => {
		const pluginsOne = getAllPluginsIndexedBySiteId( state );
		const pluginsTwo = getAllPluginsIndexedBySiteId( state );

		expect( pluginsOne ).toBe( pluginsTwo );
	} );
} );

describe( 'getFilteredAndSortedPlugins', () => {
	test( 'Should get an empty array if the requested site is not in the current state', () => {
		const plugins = getFilteredAndSortedPlugins( state, [ nonExistingSiteId1 ], undefined );
		expect( plugins ).toHaveLength( 0 );
	} );

	test( 'Should get an empty array if the plugins for this site are still being requested', () => {
		const plugins = getFilteredAndSortedPlugins( state, [ siteThreeId ], undefined );
		expect( plugins ).toHaveLength( 0 );
	} );

	test( 'Should get a plugin list of length 3 if both sites are requested', () => {
		const plugins = getFilteredAndSortedPlugins( state, [ siteOneId, siteTwoId ], undefined );
		expect( plugins ).toHaveLength( 3 );
	} );

	test( 'Should get a plugin list containing all plugins in sorted order if both sites are requested', () => {
		const plugins = getFilteredAndSortedPlugins( state, [ siteOneId, siteTwoId ], undefined );
		expect( plugins ).toEqual( [ akismetWithSites, helloDollyWithSites, jetpackWithSites ] );
	} );

	test( 'Should get a plugin list of length 2 if only site 1 is requested', () => {
		const plugins = getFilteredAndSortedPlugins( state, [ siteOneId ], undefined );
		expect( plugins ).toHaveLength( 2 );
	} );

	test( 'Should get a plugin list of length 2 if active plugins on both sites are requested', () => {
		const plugins = getFilteredAndSortedPlugins( state, [ siteOneId, siteTwoId ], 'active' );
		expect( plugins ).toHaveLength( 2 );
	} );

	test( 'Should get a plugin list of length 1 if inactive plugins on site 1 is requested', () => {
		const plugins = getFilteredAndSortedPlugins( state, [ siteOneId ], 'inactive' );
		expect( plugins ).toHaveLength( 1 );
	} );
} );

describe( 'getPluginsWithUpdates', () => {
	test( 'Should get an empty array if the requested site is not in the current state', () => {
		const plugins = getPluginsWithUpdates( state, [ nonExistingSiteId1 ] );
		expect( plugins ).toHaveLength( 0 );
	} );

	test( 'Should get a plugin list with the Jetpack site with "type: plugin" on it', () => {
		const plugins = getPluginsWithUpdates( state, [ siteOneId, siteTwoId ] );
		expect( plugins ).toEqual( [ { ...jetpackWithSites, type: 'plugin' } ] );
	} );
} );

describe( 'getPluginOnSites', () => {
	test( 'Should get an undefined value if the requested sites are not in the current state', () => {
		const siteIds = [ nonExistingSiteId1, nonExistingSiteId2 ];
		expect( getPluginOnSites( state, siteIds, 'akismet' ) ).toBeUndefined();
	} );

	test( 'Should get an undefined value if the requested plugin on these sites is not in the current state', () => {
		expect( getPluginOnSites( state, [ siteOneId ], 'jetpack' ) ).toBeUndefined();
	} );

	test( 'Should get the plugin if the it exists on one or more of the requested sites', () => {
		const siteIds = [ siteOneId, siteTwoId ];
		const plugin = getPluginOnSites( state, siteIds, 'hello-dolly' );
		const sitesWithPlugins = {
			[ siteOneId ]: {
				active: helloDolly.active,
				autoupdate: helloDolly.autoupdate,
				update: helloDolly.update,
				version: helloDolly.version,
			},
			[ siteTwoId ]: {
				active: helloDolly.active,
				autoupdate: helloDolly.autoupdate,
				update: helloDolly.update,
				version: helloDolly.version,
			},
		};
		const { active, autoupdate, update, version, ...pluginProperties } = helloDolly;
		expect( plugin ).toEqual( { ...pluginProperties, sites: sitesWithPlugins } );
	} );
} );

describe( 'getPluginOnSite', () => {
	test( 'Should get an undefined value if the requested site is not in the current state', () => {
		expect( getPluginOnSite( state, nonExistingSiteId1, 'akismet' ) ).toBeUndefined();
	} );

	test( 'Should get an undefined value if the requested plugin on this site is not in the current state', () => {
		expect( getPluginOnSite( state, siteOneId, 'jetpack' ) ).toBeUndefined();
	} );

	test( 'Should get the plugin if the it exists on the requested site', () => {
		const plugin = getPluginOnSite( state, siteOneId, 'akismet' );
		const siteProperties = {
			active: akismet.active,
			autoupdate: akismet.autoupdate,
			update: akismet.update,
			version: akismet.version,
		};
		const expectedPlugin = {
			...akismet,
			...{ sites: { [ siteOneId ]: siteProperties } },
		};
		expect( plugin ).toEqual( expectedPlugin );
	} );
} );

describe( 'getPluginsOnSite', () => {
	test( 'Should get an array of undefined if the requested site is not in the current state', () => {
		expect( getPluginsOnSite( state, siteThreeId, [ 'jetpack' ] ) ).toEqual( [ undefined ] );
	} );

	test( 'Should get an  array of undefined if the requested site has no plugins', () => {
		expect( getPluginsOnSite( state, siteFourId, [ 'akismet' ] ) ).toEqual( [ undefined ] );
	} );

	test( 'Should get an array with the plugin objects for the requested plugins with site properties lifted onto the plugin object', () => {
		const plugins = getPluginsOnSite( state, siteOneId, [ 'akismet' ] );
		expect( plugins ).toEqual( [
			{
				...akismetWithSites,
				...{
					active: akismetWithSites.sites[ siteOneId ].active,
					autoupdate: akismetWithSites.sites[ siteOneId ].autoupdate,
					version: akismetWithSites.sites[ siteOneId ].version,
				},
			},
		] );
	} );
} );

describe( 'getSitesWithPlugin', () => {
	test( 'Should get an empty array if the requested site is not in the current state', () => {
		expect( getSitesWithPlugin( state, [ nonExistingSiteId1 ], 'akismet' ) ).toHaveLength( 0 );
	} );

	test( "Should get an empty array if the requested plugin doesn't exist on any sites' state", () => {
		expect( getSitesWithPlugin( state, [ siteOneId, siteTwoId ], 'vaultpress' ) ).toHaveLength( 0 );
	} );

	test( 'Should get an array of sites with the requested plugin', () => {
		const siteIds = getSitesWithPlugin( state, [ siteOneId, siteTwoId ], 'jetpack' );
		expect( siteIds ).toEqual( [ siteTwoId ] );
	} );
} );

describe( 'getSiteObjectsWithPlugin', () => {
	test( 'Should get an empty array if the requested site is not in the current state', () => {
		expect( getSiteObjectsWithPlugin( state, [ nonExistingSiteId1 ], 'akismet' ) ).toHaveLength(
			0
		);
	} );

	test( "Should get an empty array if the requested plugin doesn't exist on any sites' state", () => {
		expect(
			getSiteObjectsWithPlugin( state, [ siteOneId, siteTwoId ], 'vaultpress' )
		).toHaveLength( 0 );
	} );

	test( 'Should get an array of sites with the requested plugin', () => {
		const siteIds = getSiteObjectsWithPlugin( state, [ siteOneId, siteTwoId ], 'jetpack' );
		expect( siteIds ).toEqual( [ getSite( state, siteTwoId ) ] );
	} );
} );

describe( 'getSitesWithoutPlugin', () => {
	test( 'Should get an empty array if the requested site is not in the current state', () => {
		expect( getSitesWithoutPlugin( state, [ nonExistingSiteId1 ], 'akismet' ) ).toHaveLength( 0 );
	} );

	test( "Should get an array of sites that don't have the plugin in their state", () => {
		const siteIds = getSitesWithoutPlugin( state, [ siteOneId, siteTwoId ], 'akismet' );
		expect( siteIds ).toEqual( [ siteTwoId ] );
	} );

	test( 'Should get an empty array if the requested plugin exists on all requested sites', () => {
		const siteIds = getSitesWithoutPlugin( state, [ siteOneId, siteTwoId ], 'hello-dolly' );
		expect( siteIds ).toHaveLength( 0 );
	} );
} );

describe( 'getStatusForPlugin', () => {
	test( 'Should get `undefined` if the requested site is not in the current state', () => {
		expect( getStatusForPlugin( state, nonExistingSiteId1, 'akismet/akismet' ) ).toBe( undefined );
	} );

	test( 'Should get `undefined` if the requested plugin on this site is not in the current state', () => {
		expect( getStatusForPlugin( state, siteOneId, 'hello-dolly/hello' ) ).toBe( undefined );
	} );

	test( 'Should get the log if the requested site & plugin have logs', () => {
		expect( getStatusForPlugin( state, siteOneId, 'akismet/akismet' ) ).toEqual( {
			status: 'inProgress',
			siteId: siteOneId,
			pluginId: 'akismet/akismet',
			action: ENABLE_AUTOUPDATE_PLUGIN,
		} );
	} );
} );

describe( 'isPluginActionStatus', () => {
	test( 'Should get `false` if the requested site is not in the current state', () => {
		expect(
			isPluginActionStatus(
				state,
				nonExistingSiteId1,
				'jetpack/jetpack',
				DEACTIVATE_PLUGIN,
				'completed'
			)
		).toBe( false );
	} );

	test( 'Should get `false` if the plugin status for the action does not exist.', () => {
		expect(
			isPluginActionStatus( state, siteOneId, 'jetpack/jetpack', INSTALL_PLUGIN, 'completed' )
		).toBe( false );
	} );

	test( 'Should get `false` if the plugin status for the action does not match the status.', () => {
		expect(
			isPluginActionStatus( state, siteOneId, 'jetpack/jetpack', DEACTIVATE_PLUGIN, 'inProgress' )
		).toBe( false );
	} );

	test( 'Should get `false` if the plugin status for none of the actions matches the status.', () => {
		expect(
			isPluginActionStatus(
				state,
				siteOneId,
				'jetpack/jetpack',
				[ INSTALL_PLUGIN, ENABLE_AUTOUPDATE_PLUGIN ],
				'completed'
			)
		).toBe( false );
	} );

	test( 'Should get `true` if the plugin status for the action matches the status.', () => {
		expect(
			isPluginActionStatus( state, siteOneId, 'jetpack/jetpack', DEACTIVATE_PLUGIN, 'completed' )
		).toBe( true );
	} );

	test( 'Should get `true` if the plugin status for one of the actions matches the status.', () => {
		expect(
			isPluginActionStatus(
				state,
				siteOneId,
				'jetpack/jetpack',
				[ INSTALL_PLUGIN, DEACTIVATE_PLUGIN ],
				'completed'
			)
		).toBe( true );
	} );
} );

describe( 'isPluginActionInProgress', () => {
	test( 'Should get `false` if the plugin status for the action is not "inProgress".', () => {
		expect(
			isPluginActionInProgress( state, siteOneId, 'jetpack/jetpack', DEACTIVATE_PLUGIN )
		).toBe( false );
	} );

	test( 'Should get `true` if the plugin status for the action is "inProgress".', () => {
		expect(
			isPluginActionInProgress( state, siteOneId, 'akismet/akismet', ENABLE_AUTOUPDATE_PLUGIN )
		).toBe( true );
	} );
} );

describe( 'getPluginStatusesByType', () => {
	test( 'Should return a list of all plugin statuses, and add siteId and pluginId to each status.', () => {
		expect( getPluginStatusesByType( state, 'completed' ) ).toEqual( [
			{
				siteId: siteOneId,
				pluginId: 'jetpack/jetpack',
				action: DEACTIVATE_PLUGIN,
				status: 'completed',
			},
		] );
	} );

	test( 'Should return an empty array if there are no matching statuses of that type.', () => {
		expect( getPluginStatusesByType( state, 'someOtherType' ) ).toEqual( [] );
	} );
} );

describe( 'isPluginActive', () => {
	test( 'Should return false if the plugin is not found', () => {
		expect( isPluginActive( state, siteOneId, 'not' ) ).toEqual( false );
	} );

	test( 'Should return false if the site is not found', () => {
		expect( isPluginActive( state, nonExistingSiteId1, 'akismet' ) ).toEqual( false );
	} );

	test( 'Should return false if the plugin is not found on the site', () => {
		expect( isPluginActive( state, siteTwoId, 'akismet' ) ).toEqual( false );
	} );

	test( 'Should return true if the plugin is active', () => {
		expect( isPluginActive( state, siteOneId, 'akismet' ) ).toEqual( true );
	} );

	test( 'Should return false if the plugin is not active', () => {
		expect( isPluginActive( state, siteOneId, 'hello-dolly' ) ).toEqual( false );
	} );
} );
