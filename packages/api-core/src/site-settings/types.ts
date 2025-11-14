export interface SiteSettings {
	blog_public?: number;
	is_fully_managed_agency_site?: boolean;
	gmt_offset?: number | string;
	timezone_string?: string;
	/**
	 * @deprecated Use `wpcom_public_coming_soon` instead.
	 */
	wpcom_coming_soon?: number | string;
	wpcom_public_coming_soon?: number | string;
	wpcom_data_sharing_opt_out?: boolean | string;
	wpcom_prevent_third_party_sharing?: boolean;
	wpcom_gifting_subscription?: boolean;
	wpcom_performance_report_url?: string;
	wpcom_legacy_contact?: string;
	wpcom_locked_mode?: boolean;
	mcp_abilities?: SiteMcpAbilities;
	jetpack_holiday_snow_enabled?: boolean;
	big_sky_enable?: boolean;
	big_sky_site_metadata?: {
		isOnboarded?: boolean;
	};
}

export type SiteMcpAbilities = Record<
	string,
	{
		name: string;
		title: string;
		description: string;
		category: string;
		type: string;
		enabled: boolean;
	}
>;
