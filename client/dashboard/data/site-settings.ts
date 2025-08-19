import wpcom from 'calypso/lib/wp';

export interface SiteSettings {
	blog_public?: number;
	is_fully_managed_agency_site?: boolean;
	gmt_offset?: number;
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
	jetpack_waf_automatic_rules?: boolean;
	jetpack_waf_automatic_rules_last_updated_timestamp?: number;
	jetpack_waf_ip_allow_list_enabled?: boolean;
	jetpack_waf_ip_allow_list?: string;
	jetpack_waf_ip_block_list_enabled?: boolean;
	jetpack_waf_ip_block_list?: string;
}

export async function fetchSiteSettings( siteId: number ): Promise< SiteSettings > {
	const { settings } = await wpcom.req.get( {
		path: `/sites/${ siteId }/settings`,
		apiVersion: '1.4',
	} );
	return settings;
}

export async function updateSiteSettings(
	siteId: number,
	data: Partial< SiteSettings >
): Promise< Partial< SiteSettings > > {
	const { updated } = await wpcom.req.post(
		{
			path: `/sites/${ siteId }/settings`,
			apiVersion: '1.4',
		},
		data
	);
	return updated;
}
