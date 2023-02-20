import deepFreeze from 'deep-freeze';
import {
	DEACTIVATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	INSTALL_PLUGIN,
} from 'calypso/lib/plugins/constants';
import { userState } from 'calypso/state/selectors/test/fixtures/user-state';
import {
	getAllPluginsIndexedByPluginSlug,
	getAllPluginsIndexedBySiteId,
	getFilteredAndSortedPlugins,
} from '../selectors-ts';
import { akismet, helloDolly, jetpack } from './fixtures/plugins';

const siteOneId = 12345;
const siteTwoId = 54321;
const siteThreeId = 21435;

const nonExistingSiteId = 0;

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

		expect( plugins[ nonExistingSiteId ] ).toEqual( undefined );
	} );

	test( 'Memozies the returned plugins object', () => {
		const pluginsOne = getAllPluginsIndexedBySiteId( state );
		const pluginsTwo = getAllPluginsIndexedBySiteId( state );

		expect( pluginsOne ).toBe( pluginsTwo );
	} );
} );

describe( 'getFilteredAndSortedPlugins', () => {
	test( 'Should get an empty array if the requested site is not in the current state', () => {
		const plugins = getFilteredAndSortedPlugins( state, [ nonExistingSiteId ], undefined );
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
