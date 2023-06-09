const placeSitePropsOnSiteObject = ( pluginObject ) => {
	const { active, version, autoupdate, update, ...rest } = pluginObject;

	const siteObject = {};
	[ 'active', 'version', 'autoupdate', 'update' ].forEach( ( propName ) => {
		if ( pluginObject[ propName ] ) {
			siteObject[ propName ] = pluginObject[ propName ];
		}
	} );

	return {
		sites: {
			[ 2916284 ]: siteObject,
		},
		...rest,
	};
};

const placeSitePropsOnSiteObject = ( pluginObject ) => {
	const { active, version, autoupdate, update, ...rest } = pluginObject;

	const siteObject = {};
	[ 'active', 'version', 'autoupdate', 'update' ].forEach( ( propName ) => {
		if ( pluginObject[ propName ] ) {
			siteObject[ propName ] = pluginObject[ propName ];
		}
	} );

	return {
		sites: {
			[ 2916284 ]: siteObject,
		},
		...rest,
	};
};

export const akismet = {
	id: 'akismet/akismet',
	slug: 'akismet',
	name: 'Akismet',
	plugin_url: 'https://akismet.com/',
	description:
		'Used by millions, Akismet is quite possibly the best way in the world to <strong>protect your blog from spam</strong>. It keeps your site protected even while you sleep. To get started: 1) Click the "Activate" link to the left of this description, 2) <a href="https://akismet.com/get/">Sign up for an Akismet plan</a> to get an API key, and 3) Go to your Akismet configuration page, and save your API key.',
	author: 'Automattic',
	author_url: 'https://automattic.com/wordpress-plugins/',
	network: false,
	active: true,
	version: '3.1.11',
	autoupdate: true,
};
export const akismetWithSites = placeSitePropsOnSiteObject( akismet );

export const helloDolly = {
	id: 'hello-dolly/hello',
	slug: 'hello-dolly',
	name: 'Hello Dolly',
	plugin_url: 'https://wordpress.org/plugins/hello-dolly/',
	description:
		'This is not just a plugin, it symbolizes the hope and enthusiasm of an entire generation summed up in two words sung most famously by Louis Armstrong: Hello, Dolly. When activated you will randomly see a lyric from <cite>Hello, Dolly</cite> in the upper right of your admin screen on every page',
	author: 'Matt Mullenweg',
	author_url: 'http://ma.tt/',
	network: false,
	active: false,
	version: '1.6',
	autoupdate: true,
};

export const jetpack = {
	id: 'jetpack/jetpack',
	slug: 'jetpack',
	name: 'Jetpack by WordPress.com',
	plugin_url: 'http://jetpack.com',
	description:
		'Bring the power of the WordPress.com cloud to your self-hosted WordPress. Jetpack enables you to connect your blog to a WordPress.com account to use the powerful features normally only available to WordPress.com users.',
	author: 'Automattic',
	author_url: 'http://jetpack.com',
	network: false,
	active: true,
	version: '4.1.1',
	autoupdate: true,
	update: {
		id: '20101',
		slug: 'jetpack',
		plugin: 'jetpack/jetpack.php',
		new_version: '4.2.2',
		url: 'https://wordpress.org/plugins/jetpack/',
		package: 'https://downloads.wordpress.org/plugin/jetpack.4.2.2.zip',
		tested: '4.6',
		compatibility: {
			scalar: {
				scalar: false,
			},
		},
	},
};
export const jetpackWithSites = placeSitePropsOnSiteObject( jetpack );

export const jetpackUpdated = {
	id: 'jetpack/jetpack',
	slug: 'jetpack',
	name: 'Jetpack by WordPress.com',
	plugin_url: 'http://jetpack.com',
	description:
		'Bring the power of the WordPress.com cloud to your self-hosted WordPress. Jetpack enables you to connect your blog to a WordPress.com account to use the powerful features normally only available to WordPress.com users.',
	author: 'Automattic',
	author_url: 'http://jetpack.com',
	network: false,
	log: [ 'Array' ],
	active: true,
	version: '4.2.2',
	autoupdate: true,
};

export const healthCheck = {
	id: 'health-check/health-check',
	name: 'Health Check &amp; Troubleshooting',
};
