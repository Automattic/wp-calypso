import type { SiteDetails } from '@automattic/data-stores';

const siteId = 12345678;
const pluginId = 'test';
const paidPluginId = 'test-paid';

const site: SiteDetails = {
	ID: siteId,
	name: 'test',
	description: 'test site',
	URL: 'https://test.wordpress.com',
	launch_status: '',
	title: '',
	jetpack: true,
	logo: { id: 'logoId', sizes: [ 'small' ], url: 'logoURL' },
	options: {
		admin_url: 'https://test.wordpress.com/wp-admin',
	},
	capabilities: {
		edit_pages: true,
		edit_posts: true,
		edit_others_posts: true,
		edit_others_pages: true,
		delete_posts: true,
		delete_others_posts: true,
		edit_theme_options: true,
		edit_users: true,
		list_users: true,
		manage_categories: true,
		manage_options: true,
		moderate_comments: true,
		activate_wordads: true,
		promote_users: true,
		publish_posts: true,
		upload_files: true,
		delete_users: true,
		remove_users: true,
		own_site: true,
		view_hosting: true,
		view_stats: true,
		activate_plugins: true,
	},
	domain: 'test.wordpress.com',
	locale: '',
	slug: 'test.wordpress.com',
	is_multisite: false,
};

const plugin = {
	id: pluginId,
	last_updated: '2021-09-16 12:40am GMT',
	sites: { [ `${ siteId }` ]: { ID: siteId, canUpdateFiles: true } },
	icon: '',
	name: 'Plugin 1',
	pluginsOnSites: [],
	slug: pluginId,
	wporg: true,
	version: '11.3',
	update: { new_version: '11.5', canUpdateFiles: true },
};

const paidPlugin = {
	...plugin,
	id: paidPluginId,
	slug: paidPluginId,
	isMarketplaceProduct: true,
	product_type: 'marketplace',
};

export { site, plugin, paidPlugin };
