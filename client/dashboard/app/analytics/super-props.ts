import config from '@automattic/calypso-config';
import { SITE_FIELDS, SITE_OPTIONS } from '../../data/constants';
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

function getSiteFromCache( queryClient: QueryClient, siteSlug: string ): Site | undefined {
	const site = queryClient.getQueryData< Site >( [ 'site', siteSlug, SITE_FIELDS, SITE_OPTIONS ] );
	if ( site ) {
		return site;
	}

	const sites = queryClient.getQueryData< Site[] >( [ 'sites', SITE_FIELDS, SITE_OPTIONS ] );
	return sites?.find( ( s ) => s.slug === siteSlug );
}
