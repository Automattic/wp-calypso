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
