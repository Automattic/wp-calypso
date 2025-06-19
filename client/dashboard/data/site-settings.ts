import wpcom from 'calypso/lib/wp';

export interface SiteSettings {
	blog_public?: number;
	is_fully_managed_agency_site?: boolean;
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
}

export async function fetchSiteSettings( siteId: number ): Promise< SiteSettings > {
	const { settings } = await wpcom.req.get( {
		path: `/sites/${ siteId }/settings`,
		apiVersion: '1.4',
	} );
	return settings;
}

export async function updateSiteSettings( siteId: number, data: Partial< SiteSettings > ) {
	const { updated } = await wpcom.req.post(
		{
			path: `/sites/${ siteId }/settings`,
			apiVersion: '1.4',
		},
		data
	);
	return updated;
}
