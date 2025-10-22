import { siteBySlugQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import type { AppConfig } from '../context';
import type { User, Site } from '@automattic/api-core';
import type { QueryClient } from '@tanstack/react-query';
import type { AnyRouter } from '@tanstack/react-router';

export const getSuperProps =
	( {
		user,
		router,
		queryClient,
		queries,
	}: {
		user: User;
		router: AnyRouter;
		queryClient: QueryClient;
		queries: AppConfig[ 'queries' ];
	} ) =>
	() => {
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

		const siteSlug = router.state.matches.at( -1 )?.params?.siteSlug;
		if ( ! siteSlug ) {
			return superProps;
		}

		const site = getSiteFromCache( { queryClient, queries, siteSlug } );
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
 * Attempts to retrieve the site information from the tanstack cache.
 *
 * It looks for the site slug in both the "site" and "sites" caches. Perhaps it's
 * overkill to search in both places. But this whole thing is a heuristic - we're
 * hoping to attach site info if it happens to be available. So I think checking
 * both caches represents a "best effort" attempt.
 */
function getSiteFromCache( {
	queryClient,
	queries,
	siteSlug,
}: {
	queryClient: QueryClient;
	queries: AppConfig[ 'queries' ];
	siteSlug: string;
} ): Site | undefined {
	const site = queryClient.getQueryData< Site >( siteBySlugQuery( siteSlug ).queryKey );
	if ( site ) {
		return site;
	}

	const sites = queryClient.getQueryData< Site[] >( queries.sitesQuery().queryKey );
	return sites?.find( ( s ) => s.slug === siteSlug );
}
