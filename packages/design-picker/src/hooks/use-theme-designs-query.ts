import { isDesignAvailableForV13N } from '@automattic/data-stores';
import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import wpcom from 'calypso/lib/wp'; // eslint-disable-line no-restricted-imports
import type { Design } from '../types';

// Ideally this data should come from the themes API, maybe by a tag that's applied to
// themes? e.g. `link-in-bio` or `no-fold`
const STATIC_PREVIEWS = [
	'bantry',
	'sigler',
	'miller',
	'pollard',
	'paxton',
	'jones',
	'baker',
	'kingsley',
];

export interface UseThemeDesignsQueryOptions {
	filter?: string;
	tier?: 'all' | 'free' | 'premium';
}

export function useThemeDesignsQuery(
	{ filter = 'auto-loading-homepage', tier = 'all' }: UseThemeDesignsQueryOptions = {},
	queryOptions: UseQueryOptions< unknown, unknown, Design[] > = {}
): UseQueryResult< Design[] > {
	return useQuery< any, unknown, Design[] >(
		[ 'themes', filter, tier ],
		() =>
			wpcom.req.get( '/themes', {
				search: '',
				number: 50,
				tier,
				filter,
				apiVersion: '1.2',
			} ),
		{
			// Our theme offering doesn't change that often, we don't need to
			// re-fetch until the next page refresh.
			staleTime: Infinity,

			select: ( response ) => response.themes.map( apiThemeToDesign ),

			...queryOptions,

			meta: {
				// Asks Calypso not to persist the data
				persist: false,
				...queryOptions.meta,
			},
		}
	);
}

function apiThemeToDesign( { id, name, taxonomies, stylesheet, price }: any ): Design {
	// Designs use a "featured" term in the theme_picks taxonomy. For example: Blank Canvas
	const isFeaturedPicks = !! taxonomies?.theme_picks?.find(
		( { slug }: any ) => slug === 'featured'
	);

	const is_premium = stylesheet && stylesheet.startsWith( 'premium/' );

	return {
		slug: id,
		title: name,
		recipe: {
			stylesheet,
		},
		is_premium,
		categories: taxonomies?.theme_subject ?? [],
		features: [],
		is_featured_picks: isFeaturedPicks,
		showFirst: isFeaturedPicks,
		...( STATIC_PREVIEWS.includes( id ) && { preview: 'static' } ),
		design_type: is_premium ? 'premium' : 'standard',
		price,
		verticalizable: isDesignAvailableForV13N( stylesheet ),

		// Deprecated; used for /start flow
		stylesheet,
		template: id,
		theme: id,
	};
}
