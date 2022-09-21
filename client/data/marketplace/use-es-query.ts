import languages, { LanguageSlug } from '@automattic/languages';
import { UseQueryResult, UseQueryOptions, useInfiniteQuery, InfiniteData } from 'react-query';
import { useSelector } from 'react-redux';
import {
	extractSearchInformation,
	getPreinstalledPremiumPluginsVariations,
} from 'calypso/lib/plugins/utils';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { DEFAULT_PAGE_SIZE } from './constants';
import { search } from './search-api';
import { getPluginsListKey } from './utils';
import type { ESHits, ESResponse, Plugin, PluginQueryOptions, Icon } from './types';

/**
 *
 * @param pluginSlug
 * @param icons
 * @returns A string containing an icon url or
 * 	a default generated url Icon if icons param is falsy, it is not JSON or it does not contain a valid resolution
 */
const createIconUrl = ( pluginSlug: string, icons?: string ): string => {
	const defaultIconUrl = buildDefaultIconUrl( pluginSlug );
	if ( ! icons ) return defaultIconUrl;

	let iconsObject: Record< string, Icon > = {};
	try {
		iconsObject = JSON.parse( icons );
	} catch ( error ) {
		return defaultIconUrl;
	}

	// Transform Icon response for easier handling
	const iconByResolution = Object.values( iconsObject ).reduce(
		( iconByResolution, currentIcon ) => {
			const newKey = currentIcon.resolution;
			iconByResolution[ newKey ] = currentIcon;
			return iconByResolution;
		},
		{} as Record< string, Icon >
	);

	const icon =
		iconByResolution[ '256x256' ] ||
		iconByResolution[ '128x128' ] ||
		iconByResolution[ '2x' ] ||
		iconByResolution[ '1x' ] ||
		iconByResolution.svg ||
		iconByResolution.default;

	if ( ! icon ) return defaultIconUrl;

	return buildIconUrl( pluginSlug, icon.location, icon.filename, icon.revision );
};

function buildIconUrl( pluginSlug: string, location: string, filename: string, revision: string ) {
	return `https://ps.w.org/${ pluginSlug }/${ location }/${ filename }?rev=${ revision }`;
}

function buildDefaultIconUrl( pluginSlug: string ) {
	return `https://s.w.org/plugins/geopattern-icon/${ pluginSlug }.svg`;
}

const mapStarRatingToPercent = ( starRating?: number ) => ( ( starRating ?? 0 ) / 5 ) * 100;

const mapIndexResultsToPluginData = ( results: ESHits ): Plugin[] => {
	if ( ! results ) return [];
	return results.map( ( { fields: hit, railcar } ) => {
		const plugin: Plugin = {
			name: hit.plugin.title, // TODO: add localization
			slug: hit.slug,
			version: hit[ 'plugin.stable_tag' ],
			author: hit.author,
			author_name: hit.plugin.author,
			author_profile: '', // TODO: get author profile URL
			tested: hit[ 'plugin.tested' ],
			rating: mapStarRatingToPercent( hit.plugin.rating ),
			num_ratings: hit.plugin.num_ratings,
			support_threads: hit[ 'plugin.support_threads' ],
			support_threads_resolved: hit[ 'plugin.support_threads_resolved' ],
			active_installs: hit[ 'plugin.active_installs' ],
			last_updated: hit.modified,
			short_description: hit.plugin.excerpt, // TODO: add localization
			icon: createIconUrl( hit.slug, hit.plugin.icons ),
			railcar,
		};

		plugin.variations = getPreinstalledPremiumPluginsVariations( plugin );

		return plugin;
	} );
};

const getWpLocaleBySlug = ( slug: LanguageSlug ) => {
	const defaultLanguage = 'en';

	// the wpLocale for `en` would be `en_US`, but the server uses `en` too
	if ( defaultLanguage === slug ) {
		return slug;
	}

	return languages.find( ( l ) => l.langSlug === slug )?.wpLocale || defaultLanguage;
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
				category: options.category,
				pageHandle: pageParam,
				pageSize,
				locale: getWpLocaleBySlug( options.locale || locale ),
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
