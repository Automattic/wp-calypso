import type { AgencySite } from '@automattic/api-core';

// The endpoint may omit the scheme, so normalize to a full URL.
export function getSiteUrl( site: AgencySite ): string {
	return site.url_with_scheme || `https://${ site.url }`;
}

// The endpoint doesn't return an admin URL; derive it from the site URL.
export function getAdminUrl( site: AgencySite ): string {
	return `${ getSiteUrl( site ).replace( /\/$/, '' ) }/wp-admin/`;
}

export function getSiteName( site: AgencySite ): string {
	return site.blogname || site.url;
}

export function getDisplayUrl( site: AgencySite ): string {
	return getSiteUrl( site ).replace( /^https?:\/\//, '' );
}

// Sites added by URL alone have no Jetpack connection, so nothing that needs to
// reach the site works on them.
export function isUrlOnlySite( site: AgencySite ): boolean {
	return !! site.sticker?.includes( 'jetpack-manage-url-only-site' );
}

export function isAtomicSite( site: AgencySite ): boolean {
	return !! site.is_atomic;
}

export function isDevSite( site: AgencySite ): boolean {
	return !! site.a4a_is_dev_site;
}

/**
 * Whether the agency can act on a site at all. Simple sites aren't managed
 * through the agency dashboard, a migration in progress leaves the profile in
 * flux, and an unhealthy connection means requests to the site will fail.
 */
export function canActOnSite( site: AgencySite ): boolean {
	return (
		! site.is_simple &&
		! site.sticker?.includes( 'migration-in-process' ) &&
		site.is_connection_healthy !== false
	);
}
