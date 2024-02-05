import { useQuery } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';
import { getJetpackSiteCollisions, getUnmappedUrl } from 'calypso/lib/site/utils';
import { urlToSlug, withoutHttp } from 'calypso/lib/url';
import {
	SITE_EXCERPT_REQUEST_FIELDS,
	SITE_EXCERPT_REQUEST_OPTIONS,
} from './site-excerpt-constants';

export const useSiteExcerptsQuery = () =>
	useQuery( {
		queryKey: [ 'command-palette', 'site-excerpts' ],
		queryFn: () =>
			request( {
				path: '/me/sites',
				apiVersion: '1.2',
				query: new URLSearchParams( {
					fields: SITE_EXCERPT_REQUEST_FIELDS.join( ',' ),
					options: SITE_EXCERPT_REQUEST_OPTIONS.join( ',' ),
					site_visibility: 'all',
					site_activity: 'active',
					include_domain_only: 'true',
				} ).toString(),
			} ),
		select: ( data ) => {
			const sites = data?.sites.map( computeFields( data?.sites ) ) || [];
			return sites.filter( ( site ) => ! site.options?.is_domain_only );
		},
	} );

// Gets the slug for a site, it also considers the unmapped URL,
// if the site is a redirect or the domain has a jetpack collision.
function getSiteSlug( site, conflictingSites = [] ) {
	if ( ! site ) {
		return '';
	}

	const isSiteConflicting = conflictingSites.includes( site.ID );

	if ( site.options?.is_redirect || isSiteConflicting ) {
		return withoutHttp( getUnmappedUrl( site ) || '' );
	}

	return urlToSlug( site.URL );
}

function computeFields( allSites ) {
	const conflictingSites = getJetpackSiteCollisions( allSites );
	return function computeFieldsSite( data ) {
		const trimmedName = data.name?.trim() ?? '';
		const slug = getSiteSlug( data, conflictingSites );

		return {
			...data,
			title: trimmedName.length > 0 ? trimmedName : slug,
			slug,
		};
	};
}
