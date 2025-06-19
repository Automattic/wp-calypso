import config from '@automattic/calypso-config';
import { siteBySlugQuery } from '../queries/site';
import { sitesQuery } from '../queries/sites';
import type { User, Site } from '../../data/types';
import type { QueryClient } from '@tanstack/react-query';
import type { AnyRouter } from '@tanstack/react-router';

export const getSuperProps = ( user: User, router: AnyRouter, queryClient: QueryClient ) => () => {
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
 * Attempts to retrieve the site information from the tanstack cache.
 *
 * It looks for the site slug in both the "site" and "sites" caches. Perhaps it's
 * overkill to search in both places. But this whole thing is a heuristic - we're
 * hoping to attach site info if it happens to be available. So I think checking
 * both caches represents a "best effort" attempt.
 */
function getSiteFromCache( queryClient: QueryClient, siteSlug: string ): Site | undefined {
	const site = queryClient.getQueryData< Site >( siteBySlugQuery( siteSlug ).queryKey );
	if ( site ) {
		return site;
	}

	const sites = queryClient.getQueryData< Site[] >( sitesQuery().queryKey );
	return sites?.find( ( s ) => s.slug === siteSlug );
}
