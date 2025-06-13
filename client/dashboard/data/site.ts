import wpcom from 'calypso/lib/wp';

export const SITE_FIELDS = [
	'ID',
	'slug',
	'URL',
	'name',
	'icon',
	'subscribers_count',
	'plan',
	'capabilities',
	'is_a4a_dev_site',
	'is_a8c',
	'is_deleted',
	'is_coming_soon',
	'is_private',
	'is_wpcom_atomic',
	'is_wpcom_staging_site',
	'lang',
	'launch_status',
	'site_migration',
	'site_owner',
	'options',
	'jetpack',
	'jetpack_modules',
];

export const JOINED_SITE_FIELDS = SITE_FIELDS.join( ',' );

export const SITE_OPTIONS = [
	'admin_url',
	'is_redirect',
	'is_wpforteams_site',
	'p2_hub_blog_id',
	'site_creation_flow',
	'software_version',
];

export const JOINED_SITE_OPTIONS = SITE_OPTIONS.join( ',' );

export interface SiteDomain {
	id: number;
	domain: string;
	blog_id: number;
	owner: string;
	expiry: string;
	domain_status: {
		status: string;
	};
	wpcom_domain: boolean;
	sslStatus: string;
	domain_type: string;
	primary_domain: boolean;
}

export interface SitePlan {
	product_id: number;
	product_slug: string;
	product_name: string;
	product_name_short: string;
	expired: boolean;
	is_free: boolean;
	billing_period: 'Yearly' | 'Monthly';
	features: {
		active: string[];
	};
}

export interface SiteCapabilities {
	manage_options: boolean;
}

export interface SiteOptions {
	admin_url: string;
	is_redirect?: boolean;
	is_wpforteams_site?: boolean;
	p2_hub_blog_id?: number;
	site_creation_flow?: string;
	software_version: string;
}

export interface Site {
	ID: number;
	slug: string;
	name: string;
	URL: string;
	icon?: {
		ico: string;
	};
	plan?: SitePlan;
	capabilities: SiteCapabilities;
	subscribers_count: number;
	// Can be undefined for deleted sites.
	options?: SiteOptions;
	is_a4a_dev_site: boolean;
	is_a8c: boolean;
	is_deleted: boolean;
	is_coming_soon: boolean;
	is_private: boolean;
	is_wpcom_atomic: boolean;
	is_wpcom_staging_site: boolean;
	is_vip: boolean;
	lang: string;
	launch_status: string | boolean;
	site_migration: {
		migration_status?: string;
		in_progress: boolean;
		is_complete: boolean;
	};
	site_owner: number;
	jetpack: boolean;
	jetpack_modules: string[] | null;
}

export async function fetchSite( siteIdOrSlug: number | string ): Promise< Site > {
	return await wpcom.req.get(
		{ path: `/sites/${ siteIdOrSlug }` },
		{ fields: JOINED_SITE_FIELDS, options: JOINED_SITE_OPTIONS }
	);
}

export async function deleteSite( siteId: number ) {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/delete`,
	} );
}

export async function launchSite( siteId: number ) {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/launch`,
		apiNamespace: 'wpcom/v2',
	} );
}
