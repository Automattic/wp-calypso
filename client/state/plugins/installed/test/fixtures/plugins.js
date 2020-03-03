/**
 */

export const akismet = {
	id: 'akismet/akismet',
	slug: 'akismet',
	active: true,
	name: 'Akismet',
	plugin_url: 'https://akismet.com/',
	version: '3.1.11',
	description:
		'Used by millions, Akismet is quite possibly the best way in the world to <strong>protect your blog from spam</strong>. It keeps your site protected even while you sleep. To get started: 1) Click the "Activate" link to the left of this description, 2) <a href="https://akismet.com/get/">Sign up for an Akismet plan</a> to get an API key, and 3) Go to your Akismet configuration page, and save your API key.',
	author: 'Automattic',
	author_url: 'https://automattic.com/wordpress-plugins/',
	network: false,
	autoupdate: true,
};

export const helloDolly = {
	id: 'hello-dolly/hello',
	slug: 'hello-dolly',
	active: false,
	name: 'Hello Dolly',
	plugin_url: 'https://wordpress.org/plugins/hello-dolly/',
	version: '1.6',
	description:
		'This is not just a plugin, it symbolizes the hope and enthusiasm of an entire generation summed up in two words sung most famously by Louis Armstrong: Hello, Dolly. When activated you will randomly see a lyric from <cite>Hello, Dolly</cite> in the upper right of your admin screen on every page',
	author: 'Matt Mullenweg',
	author_url: 'http://ma.tt/',
	network: false,
	autoupdate: true,
};

export const jetpack = {
	id: 'jetpack/jetpack',
	slug: 'jetpack',
	active: true,
	name: 'Jetpack by WordPress.com',
	plugin_url: 'http://jetpack.com',
	version: '4.1.1',
	description:
		'Bring the power of the WordPress.com cloud to your self-hosted WordPress. Jetpack enables you to connect your blog to a WordPress.com account to use the powerful features normally only available to WordPress.com users.',
	author: 'Automattic',
	author_url: 'http://jetpack.com',
	network: false,
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

export const jetpackUpdated = {
	id: 'jetpack/jetpack',
	slug: 'jetpack',
	active: true,
	name: 'Jetpack by WordPress.com',
	plugin_url: 'http://jetpack.com',
	version: '4.2.2',
	description:
		'Bring the power of the WordPress.com cloud to your self-hosted WordPress. Jetpack enables you to connect your blog to a WordPress.com account to use the powerful features normally only available to WordPress.com users.',
	author: 'Automattic',
	author_url: 'http://jetpack.com',
	network: false,
	autoupdate: true,
	log: [ 'Array' ],
};
