import { UseQueryResult, UseQueryOptions, useInfiniteQuery, InfiniteData } from 'react-query';
import { useSelector } from 'react-redux';
import { extractSearchInformation } from 'calypso/lib/plugins/utils';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { DEFAULT_PAGE_SIZE } from './constants';
import { search } from './site-search-api';
import { ESHits, ESResponse, Plugin, PluginQueryOptions } from './types';
import { getPluginsListKey } from './utils';

// /**
//  *
//  * @param pluginSlug
//  * @param iconsArray
//  * @returns An object containing a resolution -> icon url map
//  */
// const createIconsObject = ( pluginSlug: string, iconsArray: string ) => {
// 	type Icon = {
// 		resolution: string;
// 		filename: string;
// 		location: string;
// 		revision: string;
// 	};
// 	const icons: Record< string, Icon > = phpUnserialize( iconsArray );
// 	return Object.values( icons ).reduce(
// 		( prev: Record< string, string >, { resolution, filename, location, revision } ) => {
// 			prev[
// 				resolution
// 			] = `https://ps.w.org/${ pluginSlug }/${ location }/${ filename }?rev=${ revision }`;
// 			return prev;
// 		},
// 		{}
// 	);
// };

// const createAuthorUrl = ( headerAuthor: string, headerAuthorUri: string ) =>
// 	`<a href="${ headerAuthorUri }">${ headerAuthor }</a>`;

const mapStarRatingToPercent = ( starRating?: number ) => ( starRating ?? 0 / 5 ) * 100;

const mapIndexResultsToPluginData = ( results: ESHits ): Plugin[] => {
	if ( ! results ) return [];
	return results.map( ( { fields: hit } ) => {
		const plugin = {
			name: hit[ 'title.default' ], // TODO: add localization
			slug: hit.slug,
			version: hit[ 'plugin.stable_tag' ],
			author: hit.author,
			author_name: hit.author,
			author_profile: '', // TODO: get author profile URL
			tested: hit[ 'plugin.tested' ],
			rating: mapStarRatingToPercent( hit[ 'plugin.rating' ] ),
			num_ratings: hit[ 'plugin.num_ratings' ],
			support_threads: hit[ 'plugin.support_threads' ],
			support_threads_resolved: hit[ 'plugin.support_threads_resolved' ],
			active_installs: hit[ 'plugin.active_installs' ],
			last_updated: hit.modified,
			short_description: hit[ 'excerpt.default' ], // TODO: add localization
			// icons: createIconsObject( slug, hit.blog_icon_url ),
		};
		return plugin;
	} );
};

export const useESPluginsInfinite = (
	options: PluginQueryOptions,
	{ enabled = true, staleTime = 10000, refetchOnMount = true }: UseQueryOptions = {}
): UseQueryResult => {
	const [ searchTerm, author ] = extractSearchInformation( options.searchTerm );
	const locale = useSelector( getCurrentUserLocale );
	const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;

	return useInfiniteQuery(
		getPluginsListKey( 'DEBUG-new-site-seach', options, true ),
		( { pageParam } ) =>
			search( {
				query: searchTerm,
				author,
				groupId: 'wporg',
				pageHandle: pageParam,
				pageSize,
				locale: options.locale || locale,
			} ),
		{
			select: ( data: InfiniteData< ESResponse > ) => {
				return {
					...data,
					plugins: mapIndexResultsToPluginData( data.pages.flatMap( ( p ) => p.data.results ) ),
					pagination: { results: data.pages[ 0 ]?.data?.total },
				};
			},
			getNextPageParam: ( lastPage ) => {
				return lastPage.data.page_handle || undefined;
			},
			enabled,
			staleTime,
			refetchOnMount,
		}
	);
};
