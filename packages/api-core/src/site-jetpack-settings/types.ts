export interface JetpackSettings {
	jetpack_waf_automatic_rules?: boolean;
	jetpack_waf_automatic_rules_last_updated_timestamp?: number;
	jetpack_waf_ip_allow_list_enabled?: boolean;
	jetpack_waf_ip_allow_list?: string;
	jetpack_waf_ip_block_list_enabled?: boolean;
	jetpack_waf_ip_block_list?: string;
	jetpack_sso_match_by_email?: boolean;
	jetpack_sso_require_two_step?: boolean;
}
