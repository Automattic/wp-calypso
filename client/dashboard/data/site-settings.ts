import wpcom from 'calypso/lib/wp';

export interface SiteSettings {
	is_fully_managed_agency_site?: boolean;
	wpcom_site_visibility?: 'coming-soon' | 'public' | 'private';
	wpcom_discourage_search_engines?: boolean;
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
	return fromRawSiteSettings( settings );
}

export async function updateSiteSettings( siteId: number, data: Partial< SiteSettings > ) {
	const { updated } = await wpcom.req.post(
		{
			path: `/sites/${ siteId }/settings`,
			apiVersion: '1.4',
		},
		toRawSiteSettings( data )
	);
	return fromRawSiteSettings( updated );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRawSiteSettings( rawSettings: any ): SiteSettings {
	// Pluck out raw settings which don't map directly to a field in SiteSettings.
	const {
		blog_public: blogPublicRaw,
		wpcom_coming_soon: wpcomComingSoonRaw,
		wpcom_public_coming_soon: wpcomPublicComingSoonRaw,
		wpcom_data_sharing_opt_out: wpcomDataSharingOptOutRaw,
		...settings
	} = rawSettings;

	const blog_public = Number( blogPublicRaw );
	const wpcom_coming_soon = Number( wpcomComingSoonRaw );
	const wpcom_public_coming_soon = Number( wpcomPublicComingSoonRaw );
	const wpcom_data_sharing_opt_out = Boolean( wpcomDataSharingOptOutRaw );

	if ( wpcom_coming_soon === 1 || wpcom_public_coming_soon === 1 ) {
		settings.wpcom_site_visibility = 'coming-soon';
		settings.wpcom_discourage_search_engines = false;
	} else if ( blog_public === -1 ) {
		settings.wpcom_site_visibility = 'private';
		settings.wpcom_discourage_search_engines = false;
	} else {
		settings.wpcom_site_visibility = 'public';
		settings.wpcom_discourage_search_engines = blog_public === 0;
	}

	settings.wpcom_prevent_third_party_sharing = wpcom_data_sharing_opt_out;

	return settings;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRawSiteSettings( settings: Partial< SiteSettings > ): any {
	// Pluck out settings which don't map directly to a field in the raw settings.
	const {
		wpcom_site_visibility,
		wpcom_discourage_search_engines,
		wpcom_prevent_third_party_sharing,
		...rest
	} = settings;
	const rawSettings = rest as any; // eslint-disable-line @typescript-eslint/no-explicit-any

	if ( wpcom_site_visibility !== undefined ) {
		if ( wpcom_site_visibility === 'coming-soon' ) {
			rawSettings.blog_public = 0;
			rawSettings.wpcom_public_coming_soon = 1;
			rawSettings.wpcom_data_sharing_opt_out = false;
		} else if ( wpcom_site_visibility === 'private' ) {
			rawSettings.blog_public = -1;
			rawSettings.wpcom_public_coming_soon = 0;
			rawSettings.wpcom_data_sharing_opt_out = false;
		} else {
			rawSettings.blog_public = wpcom_discourage_search_engines ? 0 : 1;
			rawSettings.wpcom_public_coming_soon = 0;
			rawSettings.wpcom_data_sharing_opt_out = wpcom_prevent_third_party_sharing;
		}

		// Take opportunity, while the user is switching visibility settings, to disable the legacy coming soon setting.
		rawSettings.wpcom_coming_soon = 0;
	}

	return rawSettings;
}
