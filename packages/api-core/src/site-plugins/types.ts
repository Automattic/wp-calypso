export type SitePluginsResponse = {
	file_mod_capabilities: {
		modify_files: boolean;
		autoupdate_files: boolean;
	};
	plugins: SitePlugin[];
};

export type SitePlugin = {
	id: string;
	active: boolean;
	author: string;
	author_url: string;
	autoupdate?: boolean;
	description: string;
	display_name?: string;
	name: string;
	network: boolean;
	plugin_url: string;
	slug: string;
	uninstallable?: boolean;
	version: string;
};

/**
 * CorePlugin represents the WordPress Core REST (wp/v2) plugins resource.
 *
 * Important notes:
 * - Canonical identifier is `plugin` (the plugin file path, e.g. "akismet/akismet.php").
 * - Shape mirrors the richer Core response (name/author/uris/description, etc.).
 * - Some client features (e.g., Scheduled Updates) key strictly on `plugin` and
 *   expect the ".php" suffix; the UI may normalize this if missing.
 * - Differs from SitePlugin (v1.2 wpcom schema) which uses `id`/`slug` and is a
 *   lighter shape.
 */
export type CorePlugin = {
	plugin: string;
	status: 'active' | 'inactive';
	name: string;
	plugin_uri: string;
	author: string;
	author_uri: string;
	description: string;
	version: string;
	network_only: boolean;
	requires_wp: string;
	requires_php: string;
	textdomain: string;
	is_managed?: boolean;
	_links: { self: { [ key: number ]: { href: string } } };
};
