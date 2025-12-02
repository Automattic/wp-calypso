// Top-level response for /me/sites/plugins?http_envelope=1
export interface PluginsResponse {
	sites: Record< string, PluginItem[] >;
}

export interface PluginUpdate {
	id: string; // e.g. "w.org/plugins/facebook-for-woocommerce"
	slug: string; // e.g. "facebook-for-woocommerce"
	new_version: string; // e.g. "3.5.6"
	package: string; // download URL
	tested: string; // WordPress version tested up to, e.g. "6.8.2"
	url: string; // plugin details page URL
}

export interface PluginItem {
	slug: string;
	active: boolean;
	id: string;
	name: string;
	plugin_url: string;
	version: string;
	description: string;
	author: string;
	author_url: string;
	network: boolean;
	autoupdate?: boolean;
	update: PluginUpdate;
	uninstallable?: boolean;
	is_managed?: boolean;
	action_links?: Record< string, string >;
}
