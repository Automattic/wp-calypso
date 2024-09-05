export type Firewall = {
	jetpack_waf_automatic_rules: boolean;
	jetpack_waf_ip_allow_list: string;
	jetpack_waf_ip_allow_list_enabled: boolean;
	jetpack_waf_ip_block_list: boolean;
	jetpack_waf_ip_block_list_enabled: boolean;
	jetpack_waf_share_data: boolean;
	jetpack_waf_share_debug_data: boolean;
	jetpack_waf_ip_list: boolean;
	bootstrap_path: string;
	standalone_mode: boolean;
	automatic_rules_available: boolean;
	automatic_rules_last_updated: string | null;
	brute_force_protection: boolean;
	waf_supported: boolean;
};

export type Site = {
	ID: number;
	name: string;
	slug: string;
	URL: string;
};
