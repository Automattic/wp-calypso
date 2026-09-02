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
