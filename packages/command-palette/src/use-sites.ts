import { useQuery } from '@tanstack/react-query';
import { getJetpackSiteCollisions, getUnmappedUrl, urlToSlug, withoutHttp } from './utils';
import type { WPCOM } from 'wpcom';

// Performance-optimized request for lists of sites.
// Don't add more fields because you will make the request slower.
export const SITE_REQUEST_FIELDS = [
	'ID',
	'URL',
	'is_coming_soon',
	'is_private',
	'visible',
	'launch_status',
	'icon',
	'name',
	'options',
	'p2_thumbnail_elements',
	'plan',
	'jetpack',
	'is_wpcom_atomic',
	'is_wpcom_staging_site',
	'user_interactions',
	'lang',
	'site_owner',
	'capabilities',
] as const;

export const SITE_COMPUTED_FIELDS = [ 'slug' ] as const;

export const SITE_REQUEST_OPTIONS = [
	'admin_url',
	'is_domain_only',
	'is_redirect',
	'is_wpforteams_site',
	'launchpad_screen',
	'site_intent',
	'unmapped_url',
	'updated_at',
	'wpcom_production_blog_id',
	'wpcom_staging_blog_ids',
	'wpcom_admin_interface',
] as const;

export const useSites = ( wpcom: WPCOM ) =>
	useQuery( {
		queryKey: [ 'command-palette', 'sites' ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: '/me/sites',
					apiVersion: '1.2',
				},
				{
					fields: SITE_REQUEST_FIELDS.join( ',' ),
					options: SITE_REQUEST_OPTIONS.join( ',' ),
					site_visibility: 'all',
					site_activity: 'active',
					include_domain_only: 'false',
				}
			),
		select: ( data ) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore TODO
			const conflictingSites = getJetpackSiteCollisions( data.sites );
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore TODO
			return data.sites.map( ( site ) => computeFields( site, conflictingSites ) );
		},
	} );

// Gets the slug for a site, it also considers the unmapped URL,
// if the site is a redirect or the domain has a jetpack collision.
// @ts-expect-error TODO
function getSiteSlug( site, conflictingSites = [] ) {
	if ( ! site ) {
		return '';
	}

	// @ts-expect-error TODO
	const isSiteConflicting = conflictingSites.includes( site.ID );

	if ( site.options?.is_redirect || isSiteConflicting ) {
		return withoutHttp( getUnmappedUrl( site ) || '' );
	}

	return urlToSlug( site.URL );
}

// @ts-expect-error TODO
function computeFields( site, conflictingSites ) {
	const trimmedName = site.name?.trim() ?? '';
	const slug = getSiteSlug( site, conflictingSites );

	return {
		...site,
		title: trimmedName.length > 0 ? trimmedName : slug,
		slug,
	};
}
