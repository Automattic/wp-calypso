import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { Category } from 'calypso/my-sites/patterns/types';

export const PATTERN_CATEGORIES = [
	'featured',
	'intro',
	'about',
	// 'buttons',
	// 'banner',
	// 'query',
	'blog',
	'posts',
	// 'call-to-action',
	// 'columns',
	// 'coming-soon',
	'contact',
	'footer',
	'forms',
	'gallery',
	'header',
	// 'link-in-bio',
	// 'media',
	'newsletter',
	// 'podcast',
	'portfolio', // For page patterns only in v1
	// 'quotes',
	'services',
	'store',
	// 'team',
	'testimonials', // Reused as "Quotes"
	// 'text',
];

export function getPatternCategoriesQueryOptions(
	locale: string,
	siteId: undefined | number,
	queryOptions: Omit< UseQueryOptions< Category[] >, 'queryKey' > = {}
): UseQueryOptions< Category[] > {
	return {
		queryKey: [ locale, siteId, 'pattern-library', 'categories' ],
		queryFn() {
			return wpcom.req.get( {
				path: `/sites/${ encodeURIComponent( siteId ?? '' ) }/block-patterns/categories`,
				apiNamespace: 'wp/v2',
				query: { locale },
			} );
		},
		select( categories ) {
			const result = [];

			for ( const name of PATTERN_CATEGORIES ) {
				const category = categories.find( ( category ) => category.name === name );
				if ( category ) {
					result.push( category );
				}
			}

			return result;
		},
		staleTime: Infinity,
		...queryOptions,
		enabled: !! siteId,
	};
}

export function usePatternCategories(
	locale: string,
	siteId: undefined | number,
	queryOptions: Omit< UseQueryOptions< Category[] >, 'queryKey' > = {}
) {
	return useQuery< Category[] >( getPatternCategoriesQueryOptions( locale, siteId, queryOptions ) );
}
