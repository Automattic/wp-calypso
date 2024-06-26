export type SitePlugin = {
	id: string;
	active: boolean;
	author: string;
	author_url: string;
	autoupdate: boolean;
	description: string;
	display_name: string;
	name: string;
	network: boolean;
	plugin_url: string;
	slug: string;
	uninstallable: boolean;
	version: string;
};

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
