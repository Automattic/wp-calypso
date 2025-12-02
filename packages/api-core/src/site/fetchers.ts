import { isWpError, DashboardDataError } from '../error';
import { wpcom } from '../wpcom-fetcher';
import type { Site } from './types';

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
	'is_wpcom_flex',
	'is_wpcom_staging_site',
	'hosting_provider_guess',
	'lang',
	'launch_status',
	'site_migration',
	'site_owner',
	'options',
	'jetpack',
	'jetpack_connection',
	'jetpack_holiday_snow_enabled',
	'jetpack_modules',
	'was_ecommerce_trial',
	'was_migration_trial',
	'was_hosting_trial',
	'was_upgraded_from_trial',
	'is_garden',
	'garden_name',
	'garden_partner',
	'garden_is_provisioned',
];

export const JOINED_SITE_FIELDS = SITE_FIELDS.join( ',' );

export const SITE_OPTIONS = [
	'admin_url',
	'created_at',
	'unmapped_url',
	'is_difm_lite_in_progress',
	'is_summer_special_2025',
	'is_domain_only',
	'is_redirect',
	'is_wpforteams_site',
	'migration_source_site_domain',
	'p2_hub_blog_id',
	'site_creation_flow',
	'site_intent',
	'software_version',
	'updated_at',
	'woocommerce_is_active',
	'wpcom_production_blog_id',
];

export const JOINED_SITE_OPTIONS = SITE_OPTIONS.join( ',' );

export async function fetchSite( siteIdOrSlug: number | string ): Promise< Site > {
	try {
		return await wpcom.req.get(
			{ path: `/sites/${ siteIdOrSlug }` },
			{ fields: JOINED_SITE_FIELDS, options: JOINED_SITE_OPTIONS }
		);
	} catch ( error ) {
		if ( isWpError( error ) && error.error === 'parse_error' ) {
			throw new DashboardDataError( 'inaccessible_jetpack', error );
		}
		throw error;
	}
}
