import config from '@automattic/calypso-config';
import languages, { LanguageSlug } from '@automattic/languages';
import {
	UseQueryResult,
	UseQueryOptions,
	useInfiniteQuery,
	InfiniteData,
	QueryKey,
	QueryFunction,
} from 'react-query';
import { useSelector } from 'react-redux';
import {
	extractSearchInformation,
	getPreinstalledPremiumPluginsVariations,
} from 'calypso/lib/plugins/utils';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { DEFAULT_PAGE_SIZE } from './constants';
import { search } from './search-api';
import { getPluginsListKey } from './utils';
import type { ESHits, ESResponse, Plugin, PluginQueryOptions } from './types';

const getIconUrl = ( pluginSlug: string, icon: string ): string => {
	try {
		const url = new URL( icon || '' );
		return url.toString();
	} catch ( _ ) {}

	return buildDefaultIconUrl( pluginSlug );
};

function buildDefaultIconUrl( pluginSlug: string ) {
	return `https://s.w.org/plugins/geopattern-icon/${ pluginSlug }.svg`;
}

const mapStarRatingToPercent = ( starRating?: number ) => ( ( starRating ?? 0 ) / 5 ) * 100;

const mapIndexResultsToPluginData = ( results: ESHits ): Plugin[] => {
	if ( ! results ) {
		return [];
	}
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
			active_installs: hit.plugin.active_installs,
			last_updated: hit.modified,
			short_description: hit.plugin.excerpt, // TODO: add localization
			icon: getIconUrl( hit.slug, hit.plugin.icons ),
			variations: {
				monthly: { product_id: hit.plugin.store_product_monthly_id },
				yearly: { product_id: hit.plugin.store_product_yearly_id },
			},
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

export const getESPluginsInfiniteQueryParams = (
	options: PluginQueryOptions,
	locale: string
): [ QueryKey, QueryFunction< ESResponse, QueryKey > ] => {
	const [ searchTerm, author ] = extractSearchInformation( options.searchTerm );
	const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
	const cacheKey = getPluginsListKey( 'DEBUG-new-site-seach', options, true );
	const fetchFn = ( { pageParam = 1 } ) =>
		search( {
			query: searchTerm,
			author,
			groupId: config.isEnabled( 'marketplace-jetpack-plugin-search' ) ? 'marketplace' : 'wporg',
			category: options.category,
			pageHandle: pageParam + '',
			pageSize,
			locale: getWpLocaleBySlug( ( options.locale || locale ) as LanguageSlug ),
		} );
	return [ cacheKey, fetchFn ];
};

export const useESPluginsInfinite = (
	options: PluginQueryOptions,
	{ enabled = true, staleTime = 10000, refetchOnMount = true }: UseQueryOptions = {}
): UseQueryResult => {
	const locale = useSelector( getCurrentUserLocale );

	return useInfiniteQuery( ...getESPluginsInfiniteQueryParams( options, locale ), {
		select: ( data: InfiniteData< ESResponse > ) => {
			return {
				...data,
				plugins: mapIndexResultsToPluginData( data.pages.flatMap( ( p ) => p.data.results ) ),
				pagination: {
					results: data.pages[ 0 ]?.data?.total,
					pages: data?.pages || [],
					page: data?.pageParams?.length || 0,
				},
			};
		},
		getNextPageParam: ( lastPage ) => {
			return lastPage.data.page_handle || undefined;
		},
		enabled,
		staleTime,
		refetchOnMount,
	} );
};
