import { UseQueryResult, UseQueryOptions, useInfiniteQuery, InfiniteData } from 'react-query';
import { useSelector } from 'react-redux';
import { extractSearchInformation } from 'calypso/lib/plugins/utils';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { DEFAULT_PAGE_SIZE } from './constants';
import { search } from './search-api';
import { getPluginsListKey } from './utils';
import type { ESHits, ESResponse, Plugin, PluginQueryOptions, Icon } from './types';

// /**
//  *
//  * @param pluginSlug
//  * @param iconsObject
//  * @returns A string containing an icon url
// 		or undefined if icons is empty or it is not JSON or it does not contain a valid resolution
//  */
const createIconUrl = ( pluginSlug: string, icons?: string ): string | undefined => {
	if ( ! icons ) return;

	let iconsObject: Record< string, Icon > = {};
	try {
		iconsObject = JSON.parse( icons );
	} catch ( error ) {
		return;
	}

	// Transform Icon response for easier handling
	const iconByResolution = Object.entries( iconsObject ).reduce( ( icon, iconByResolution ) => {
		const [ , currentIcon ] = iconByResolution;
		const newKey = currentIcon.resolution;
		icon[ newKey ] = currentIcon;
		return icon;
	}, {} as Record< string, Icon > );

	const icon =
		iconByResolution[ '256x256' ] ||
		iconByResolution[ '128x128' ] ||
		iconByResolution[ '2x' ] ||
		iconByResolution[ '1x' ] ||
		iconByResolution.svg ||
		iconByResolution.default;

	if ( ! icon ) return;

	return buildIconUrl( pluginSlug, icon.location, icon.filename, icon.revision );
};

function buildIconUrl( pluginSlug: string, location: string, filename: string, revision: string ) {
	return `https://ps.w.org/${ pluginSlug }/${ location }/${ filename }?rev=${ revision }`;
}

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
			icon: createIconUrl( hit.slug, hit[ 'plugin.icons' ] ),
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
