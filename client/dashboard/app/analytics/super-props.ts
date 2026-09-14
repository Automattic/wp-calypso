import { siteByIdQuery, siteBySlugQuery, sitesQueryKey } from '@automattic/api-queries';
// eslint-disable-next-line no-restricted-imports -- Explicit event site attribution must precede dashboard super props.
import { getValidBlogId, NO_SITE_CONTEXT } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import type { User, Site } from '@automattic/api-core';
import type { QueryClient } from '@tanstack/react-query';
import type { AnyRouter, RouterState } from '@tanstack/react-router';

export const getSuperProps =
	( user: User, router: AnyRouter, queryClient: QueryClient ) =>
	( eventProperties: Record< string, unknown > = {} ): Record< string, unknown > => {
		const superProps = {
			environment: process.env.NODE_ENV,
			environment_id: config( 'env_id' ),
			site_count: user.site_count,
			site_id_label: 'wpcom',
			client: config( 'client_slug' ),
		};

		if ( typeof window !== 'undefined' ) {
			Object.assign( superProps, {
				vph: window.innerHeight,
				vpw: window.innerWidth,
			} );
		}

		const explicitBlogId = getValidBlogId( eventProperties.blog_id );
		if ( explicitBlogId ) {
			const explicitSite = getSiteFromCache( queryClient, explicitBlogId );

			if ( ! explicitSite ) {
				const explicitSuperProps = Object.fromEntries(
					Object.entries( superProps ).filter( ( [ key ] ) => key !== 'site_id_label' )
				);
				return { ...explicitSuperProps, blog_id: explicitBlogId };
			}

			return {
				...superProps,
				blog_id: explicitBlogId,
				blog_lang: explicitSite.lang,
				site_id_label: explicitSite.jetpack ? 'jetpack' : 'wpcom',
				site_plan_id: explicitSite.plan?.product_id ?? null,
			};
		}

		if ( eventProperties.site_context_source === NO_SITE_CONTEXT ) {
			return superProps;
		}

		const siteSlug = router.state.matches.at( -1 )?.params?.siteSlug;
		if ( ! siteSlug ) {
			return superProps;
		}

		const site = getSiteFromCache( queryClient, siteSlug );
		if ( ! site ) {
			return superProps;
		}

		return {
			...superProps,
			blog_id: site.ID,
			blog_lang: site.lang,
			site_id_label: site.jetpack ? 'jetpack' : 'wpcom',
			site_plan_id: site.plan?.product_id ?? null,
		};
	};

/**
 * Normalize the path by removing leading double slashes and trailing slashes.
 */
export function getNormalizedPath( matches: RouterState[ 'matches' ], basePath = '' ) {
	const leafMatch = matches.at( -1 );
	const routeId = leafMatch?.routeId ?? '';

	const normalizedBasePath = basePath.endsWith( '/' ) ? basePath.slice( 0, -1 ) : basePath;
	return normalizedBasePath + routeId.replace( /\/$/, '' );
}

/**
 * Attempts to retrieve the site information from the tanstack cache.
 *
 * It looks for the site identifier in both the "site" and "sites" caches. Perhaps it's
 * overkill to search in both places. But this whole thing is a heuristic - we're
 * hoping to attach site info if it happens to be available. So I think checking
 * both caches represents a "best effort" attempt.
 */
export function getSiteFromCache(
	queryClient: QueryClient,
	siteSlugOrId: string | number
): Site | undefined {
	const site =
		typeof siteSlugOrId === 'string'
			? queryClient.getQueryData< Site >( siteBySlugQuery( siteSlugOrId ).queryKey )
			: queryClient.getQueryData< Site >( siteByIdQuery( siteSlugOrId ).queryKey );
	if ( site ) {
		return site;
	}

	const sitesBySlugQueries = queryClient.getQueriesData< Site >( {
		queryKey: [ 'site-by-slug' ],
	} );
	const siteById = sitesBySlugQueries
		.map( ( [ , data ] ) => data )
		.find( ( cachedSite ) => cachedSite?.ID === Number( siteSlugOrId ) );
	if ( siteById ) {
		return siteById;
	}

	const sitesQueries = queryClient.getQueriesData< Site[] | { sites: Site[] } >( {
		queryKey: sitesQueryKey,
	} );
	const cachedSites = sitesQueries
		.map( ( [ , data ] ) => {
			const sites = Array.isArray( data ) ? data : data?.sites;
			return sites || [];
		} )
		.flat();
	const sitesBySlug = new Map(
		cachedSites.map( ( cachedSite ) => [ cachedSite.slug, cachedSite ] as [ string, Site ] )
	);

	return (
		( typeof siteSlugOrId === 'string' ? sitesBySlug.get( siteSlugOrId ) : undefined ) ??
		cachedSites.find( ( cachedSite ) => cachedSite?.ID === Number( siteSlugOrId ) )
	);
}
