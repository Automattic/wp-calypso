import deepFreeze from 'deep-freeze';
import { pick } from 'lodash';
import {
	DEACTIVATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	INSTALL_PLUGIN,
} from 'calypso/lib/plugins/constants';
import { userState } from 'calypso/state/selectors/test/fixtures/user-state';
import { getSite } from 'calypso/state/sites/selectors';
import * as selectors from '../selectors';
import { akismet, helloDolly, jetpack } from './fixtures/plugins';

const userStateCopy = { ...userState };

const siteOneId = 12345;
const siteTwoId = 54321;
const siteThreeId = 21435;

const nonExistingSiteId1 = 0;
const nonExistingSiteId2 = 1;

userStateCopy.currentUser.capabilities[ siteOneId ] = { manage_options: true };
userStateCopy.currentUser.capabilities[ siteTwoId ] = { manage_options: true };
userStateCopy.currentUser.capabilities[ siteThreeId ] = { manage_options: true };

const state = deepFreeze( {
	plugins: {
		installed: {
			isRequesting: {
				[ siteOneId ]: false,
				[ siteTwoId ]: false,
				[ siteThreeId ]: true,
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
		},
	},
	...userStateCopy,
} );

describe( 'Installed plugin selectors', () => {
	test( 'should contain isRequesting method', () => {
		expect( selectors.isRequesting ).toBeInstanceOf( Function );
	} );

	test( 'should contain isRequestingForSites method', () => {
		expect( selectors.isRequestingForSites ).toBeInstanceOf( Function );
	} );

	test( 'should contain getFilteredAndSortedPlugins method', () => {
		expect( selectors.getFilteredAndSortedPlugins ).toBeInstanceOf( Function );
	} );

	test( 'should contain getPluginsWithUpdates method', () => {
		expect( selectors.getPluginsWithUpdates ).toBeInstanceOf( Function );
	} );

	test( 'should contain getPluginOnSite method', () => {
		expect( selectors.getPluginOnSite ).toBeInstanceOf( Function );
	} );

	test( 'should contain getSitesWithPlugin method', () => {
		expect( selectors.getSitesWithPlugin ).toBeInstanceOf( Function );
	} );

	test( 'should contain getSiteObjectsWithPlugin method', () => {
		expect( selectors.getSiteObjectsWithPlugin ).toBeInstanceOf( Function );
	} );

	test( 'should contain getSitesWithoutPlugin method', () => {
		expect( selectors.getSitesWithoutPlugin ).toBeInstanceOf( Function );
	} );

	test( 'should contain getLogsForPlugin method', () => {
		expect( selectors.getStatusForPlugin ).toBeInstanceOf( Function );
	} );

	describe( 'isRequesting', () => {
		test( 'Should get `false` if this site is not in the current state', () => {
			expect( selectors.isRequesting( state, nonExistingSiteId1 ) ).toBe( false );
		} );

		test( 'Should get `false` if this site is not being fetched', () => {
			expect( selectors.isRequesting( state, siteOneId ) ).toBe( false );
		} );

		test( 'Should get `true` if this site is being fetched', () => {
			expect( selectors.isRequesting( state, siteThreeId ) ).toBe( true );
		} );
	} );

	describe( 'isRequestingForSites', () => {
		test( 'Should get `false` if no sites are being fetched', () => {
			expect( selectors.isRequestingForSites( state, [ siteOneId, siteTwoId ] ) ).toBe( false );
		} );

		test( 'Should get `true` if any site is being fetched', () => {
			expect( selectors.isRequestingForSites( state, [ siteOneId, siteThreeId ] ) ).toBe( true );
		} );

		test( 'Should get `true` if any site is being fetched, even if one is not in the current state', () => {
			expect( selectors.isRequestingForSites( state, [ nonExistingSiteId1, siteThreeId ] ) ).toBe(
				true
			);
		} );

		test( 'Should get `false` if sites are not being fetched, including a site not in the current state', () => {
			expect( selectors.isRequestingForSites( state, [ nonExistingSiteId1, siteTwoId ] ) ).toBe(
				false
			);
		} );
	} );

	describe( 'getFilteredAndSortedPlugins', () => {
		test( 'Should get an empty array if the requested site is not in the current state', () => {
			const plugins = selectors.getFilteredAndSortedPlugins(
				state,
				[ nonExistingSiteId1 ],
				undefined
			);
			expect( plugins ).toHaveLength( 0 );
		} );

		test( 'Should get an empty array if the plugins for this site are still being requested', () => {
			const plugins = selectors.getFilteredAndSortedPlugins( state, [ siteThreeId ], undefined );
			expect( plugins ).toHaveLength( 0 );
		} );

		test( 'Should get a plugin list of length 3 if both sites are requested', () => {
			const plugins = selectors.getFilteredAndSortedPlugins(
				state,
				[ siteOneId, siteTwoId ],
				undefined
			);
			expect( plugins ).toHaveLength( 3 );
		} );

		test( 'Should get a plugin list containing jetpack if both sites are requested', () => {
			const plugins = selectors.getFilteredAndSortedPlugins(
				state,
				[ siteOneId, siteTwoId ],
				undefined
			);
			const siteWithPlugin = {
				[ siteTwoId ]: pick( jetpack, [ 'active', 'autoupdate', 'update', 'version' ] ),
			};
			const { active, autoupdate, update, version, ...pluginProperties } = jetpack;
			expect( plugins ).toEqual(
				expect.arrayContaining( [ { ...pluginProperties, sites: siteWithPlugin } ] )
			);
		} );

		test( 'Should get a plugin list of length 2 if only site 1 is requested', () => {
			const plugins = selectors.getFilteredAndSortedPlugins( state, [ siteOneId ], undefined );
			expect( plugins ).toHaveLength( 2 );
		} );

		test( 'Should get a plugin list of length 2 if active plugins on both sites are requested', () => {
			const plugins = selectors.getFilteredAndSortedPlugins(
				state,
				[ siteOneId, siteTwoId ],
				'active'
			);
			expect( plugins ).toHaveLength( 2 );
		} );

		test( 'Should get a plugin list of length 1 if inactive plugins on site 1 is requested', () => {
			const plugins = selectors.getFilteredAndSortedPlugins( state, [ siteOneId ], 'inactive' );
			expect( plugins ).toHaveLength( 1 );
		} );
	} );

	describe( 'getPluginsWithUpdates', () => {
		test( 'Should get an empty array if the requested site is not in the current state', () => {
			const plugins = selectors.getPluginsWithUpdates( state, [ nonExistingSiteId1 ] );
			expect( plugins ).toHaveLength( 0 );
		} );

		test( 'Should get a plugin list of length 1 when we can update files on the site', () => {
			const plugins = selectors.getPluginsWithUpdates( state, [ siteOneId, siteTwoId ] );
			expect( plugins ).toHaveLength( 1 );
		} );
	} );

	describe( 'getPluginOnSite', () => {
		test( 'Should get an undefined value if the requested site is not in the current state', () => {
			expect( selectors.getPluginOnSite( state, nonExistingSiteId1, 'akismet' ) ).toBeUndefined();
		} );

		test( 'Should get an undefined value if the requested plugin on this site is not in the current state', () => {
			expect( selectors.getPluginOnSite( state, siteOneId, 'jetpack' ) ).toBeUndefined();
		} );

		test( 'Should get the plugin if the it exists on the requested site', () => {
			const plugin = selectors.getPluginOnSite( state, siteOneId, 'akismet' );
			const siteProperties = pick( akismet, [ 'active', 'autoupdate', 'update', 'version' ] );
			const expectedPlugin = {
				...akismet,
				...{ sites: { [ siteOneId ]: siteProperties } },
			};
			expect( plugin ).toEqual( expectedPlugin );
		} );
	} );

	describe( 'getPluginOnSites', () => {
		test( 'Should get an undefined value if the requested sites are not in the current state', () => {
			const siteIds = [ nonExistingSiteId1, nonExistingSiteId2 ];
			expect( selectors.getPluginOnSites( state, siteIds, 'akismet' ) ).toBeUndefined();
		} );

		test( 'Should get an undefined value if the requested plugin on these sites is not in the current state', () => {
			expect( selectors.getPluginOnSites( state, [ siteOneId ], 'jetpack' ) ).toBeUndefined();
		} );

		test( 'Should get the plugin if the it exists on one or more of the requested sites', () => {
			const siteIds = [ siteOneId, siteTwoId ];
			const plugin = selectors.getPluginOnSites( state, siteIds, 'hello-dolly' );
			const sitesWithPlugins = {
				[ siteOneId ]: pick( helloDolly, [ 'active', 'autoupdate', 'update', 'version' ] ),
				[ siteTwoId ]: pick( helloDolly, [ 'active', 'autoupdate', 'update', 'version' ] ),
			};
			const { active, autoupdate, update, version, ...pluginProperties } = helloDolly;
			expect( plugin ).toEqual( { ...pluginProperties, sites: sitesWithPlugins } );
		} );
	} );

	describe( 'getSitesWithPlugin', () => {
		test( 'Should get an empty array if the requested site is not in the current state', () => {
			expect(
				selectors.getSitesWithPlugin( state, [ nonExistingSiteId1 ], 'akismet' )
			).toHaveLength( 0 );
		} );

		test( "Should get an empty array if the requested plugin doesn't exist on any sites' state", () => {
			expect(
				selectors.getSitesWithPlugin( state, [ siteOneId, siteTwoId ], 'vaultpress' )
			).toHaveLength( 0 );
		} );

		test( 'Should get an array of sites with the requested plugin', () => {
			const siteIds = selectors.getSitesWithPlugin( state, [ siteOneId, siteTwoId ], 'jetpack' );
			expect( siteIds ).toEqual( [ siteTwoId ] );
		} );
	} );

	describe( 'getSiteObjectsWithPlugin', () => {
		test( 'Should get an empty array if the requested site is not in the current state', () => {
			expect(
				selectors.getSiteObjectsWithPlugin( state, [ nonExistingSiteId1 ], 'akismet' )
			).toHaveLength( 0 );
		} );

		test( "Should get an empty array if the requested plugin doesn't exist on any sites' state", () => {
			expect(
				selectors.getSiteObjectsWithPlugin( state, [ siteOneId, siteTwoId ], 'vaultpress' )
			).toHaveLength( 0 );
		} );

		test( 'Should get an array of sites with the requested plugin', () => {
			const siteIds = selectors.getSiteObjectsWithPlugin(
				state,
				[ siteOneId, siteTwoId ],
				'jetpack'
			);
			expect( siteIds ).toEqual( [ getSite( state, siteTwoId ) ] );
		} );
	} );

	describe( 'getSitesWithoutPlugin', () => {
		test( 'Should get an empty array if the requested site is not in the current state', () => {
			expect(
				selectors.getSitesWithoutPlugin( state, [ nonExistingSiteId1 ], 'akismet' )
			).toHaveLength( 0 );
		} );

		test( "Should get an array of sites that don't have the plugin in their state", () => {
			const siteIds = selectors.getSitesWithoutPlugin( state, [ siteOneId, siteTwoId ], 'akismet' );
			expect( siteIds ).toEqual( [ siteTwoId ] );
		} );

		test( 'Should get an empty array if the requested plugin exists on all requested sites', () => {
			const siteIds = selectors.getSitesWithoutPlugin(
				state,
				[ siteOneId, siteTwoId ],
				'hello-dolly'
			);
			expect( siteIds ).toHaveLength( 0 );
		} );
	} );

	describe( 'getStatusForPlugin', () => {
		test( 'Should get `false` if the requested site is not in the current state', () => {
			expect( selectors.getStatusForPlugin( state, nonExistingSiteId1, 'akismet/akismet' ) ).toBe(
				false
			);
		} );

		test( 'Should get `false` if the requested plugin on this site is not in the current state', () => {
			expect( selectors.getStatusForPlugin( state, siteOneId, 'hello-dolly/hello' ) ).toBe( false );
		} );

		test( 'Should get the log if the requested site & plugin have logs', () => {
			expect( selectors.getStatusForPlugin( state, siteOneId, 'akismet/akismet' ) ).toEqual( {
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
				selectors.isPluginActionStatus(
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
				selectors.isPluginActionStatus(
					state,
					siteOneId,
					'jetpack/jetpack',
					INSTALL_PLUGIN,
					'completed'
				)
			).toBe( false );
		} );

		test( 'Should get `false` if the plugin status for the action does not match the status.', () => {
			expect(
				selectors.isPluginActionStatus(
					state,
					siteOneId,
					'jetpack/jetpack',
					DEACTIVATE_PLUGIN,
					'inProgress'
				)
			).toBe( false );
		} );

		test( 'Should get `false` if the plugin status for none of the actions matches the status.', () => {
			expect(
				selectors.isPluginActionStatus(
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
				selectors.isPluginActionStatus(
					state,
					siteOneId,
					'jetpack/jetpack',
					DEACTIVATE_PLUGIN,
					'completed'
				)
			).toBe( true );
		} );

		test( 'Should get `true` if the plugin status for one of the actions matches the status.', () => {
			expect(
				selectors.isPluginActionStatus(
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
				selectors.isPluginActionInProgress( state, siteOneId, 'jetpack/jetpack', DEACTIVATE_PLUGIN )
			).toBe( false );
		} );

		test( 'Should get `true` if the plugin status for the action is "inProgress".', () => {
			expect(
				selectors.isPluginActionInProgress(
					state,
					siteOneId,
					'akismet/akismet',
					ENABLE_AUTOUPDATE_PLUGIN
				)
			).toBe( true );
		} );
	} );

	describe( 'getPluginStatusesByType', () => {
		test( 'Should return a list of all plugin statuses, and add siteId and pluginId to each status.', () => {
			expect( selectors.getPluginStatusesByType( state, 'completed' ) ).toEqual( [
				{
					siteId: siteOneId,
					pluginId: 'jetpack/jetpack',
					action: DEACTIVATE_PLUGIN,
					status: 'completed',
				},
			] );
		} );

		test( 'Should return an empty array if there are no matching statuses of that type.', () => {
			expect( selectors.getPluginStatusesByType( state, 'someOtherType' ) ).toEqual( [] );
		} );
	} );
} );
