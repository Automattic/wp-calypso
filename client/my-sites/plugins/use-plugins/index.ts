import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { Plugin } from 'calypso/data/marketplace/types';
import { useESPluginsInfinite } from 'calypso/data/marketplace/use-es-query';
import {
	useWPCOMFeaturedPlugins,
	useWPCOMPluginsList,
} from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { useCategories } from '../categories/use-categories';

interface WPORGResponse {
	data?: {
		plugins: Plugin[];
		pagination: {
			results: number;
			page: number;
			pages: number;
		};
	};
	isLoading: boolean;
	fetchNextPage?: () => void;
	hasNextPage?: boolean;
}

interface WPCOMResponse {
	data?: Plugin[];
	isLoading: boolean;
	fetchNextPage?: () => void;
}

/**
 * Multiply the wpcom rating to match the wporg value.
 * wpcom rating is from 1 to 5 while wporg is from 1 to 100.
 *
 * @param plugin
 * @returns
 */
function updateWpComRating( plugin: Plugin ) {
	if ( ! plugin || ! plugin.rating ) {
		return plugin;
	}

	plugin.rating *= 20;

	return plugin;
}

const WPCOM_CATEGORIES_BLOCKLIST = [ 'popular' ];
const WPORG_CATEGORIES_BLOCKLIST = [ 'paid', 'featured' ];

const usePlugins = ( {
	category,
	search,
	infinite = false,
	locale = '',
	wpcomEnabled,
	wporgEnabled,
}: {
	category: string;
	search?: string;
	infinite?: boolean;
	locale?: string;
	wporgEnabled?: boolean;
	wpcomEnabled?: boolean;
} ) => {
	let plugins = [];
	let isFetching = false;
	let results = 0;

	const categories = useCategories();
	const categoryTags = categories[ category || '' ]?.tags || [ category ];
	const tag = categoryTags.join( ',' );

	const { localeSlug = '' } = useTranslate();
	const wporgPluginsOptions = {
		locale: locale || localeSlug,
		category,
		tag,
		searchTerm: search,
	};

	// For this to be enabled it should:
	// 1. The request should be marked as infinite and wporg fetching should be enabled (wporgEnabled)
	// 2. Either we have a search term or we have a valid category (when searching from the top-paid or top-free page)
	const {
		data: { plugins: ESPlugins = [], pagination: ESPagination } = {},
		isLoading: isFetchingES,
		fetchNextPage,
		hasNextPage,
	} = useESPluginsInfinite( wporgPluginsOptions, {
		enabled:
			!! ( search || ! WPORG_CATEGORIES_BLOCKLIST.includes( category || '' ) ) && wporgEnabled,
	} ) as WPORGResponse;

	const { data: wpcomPluginsRaw = [], isLoading: isFetchingDotCom } = useWPCOMPluginsList(
		'all',
		search,
		tag,
		{
			enabled: ! WPCOM_CATEGORIES_BLOCKLIST.includes( category || '' ) && wpcomEnabled,
		}
	) as WPCOMResponse;

	const { data: featuredPluginsRaw = [], isLoading: isFetchingDotComFeatured } =
		useWPCOMFeaturedPlugins( {
			enabled: category === 'featured' && wpcomEnabled,
		} ) as WPCOMResponse;

	const featuredPlugins = useMemo(
		() => ( featuredPluginsRaw as Plugin[] ).map( updateWpComRating ),
		[ featuredPluginsRaw ]
	);

	const dotComPlugins = useMemo(
		() => ( wpcomPluginsRaw as Plugin[] ).map( updateWpComRating ),
		[ wpcomPluginsRaw ]
	);

	switch ( category ) {
		case 'paid':
			plugins = dotComPlugins;
			isFetching = isFetchingDotCom;
			results = dotComPlugins?.length ?? 0;
			break;
		case 'popular':
			plugins = ESPlugins;
			isFetching = isFetchingES;
			results = ESPagination?.results ?? 0;
			break;
		case 'featured':
			plugins = featuredPlugins;
			isFetching = isFetchingDotComFeatured;
			results = featuredPlugins?.length ?? 0;
			break;
		default:
			plugins = config.isEnabled( 'marketplace-jetpack-plugin-search' )
				? ESPlugins
				: [ ...dotComPlugins, ...ESPlugins ];
			isFetching = config.isEnabled( 'marketplace-jetpack-plugin-search' )
				? isFetchingES
				: isFetchingDotCom || isFetchingES;
			results = config.isEnabled( 'marketplace-jetpack-plugin-search' )
				? ESPagination?.results ?? 0
				: ( ESPagination?.results ?? 0 ) + dotComPlugins.length;

			break;
	}

	function fetchNextPageAndStop() {
		if ( ! infinite || ! hasNextPage ) {
			return;
		}

		fetchNextPage && fetchNextPage();
	}

	return {
		plugins,
		isFetching,
		fetchNextPage: fetchNextPageAndStop,
		pagination: {
			page: ESPagination?.page,
			pages: ESPagination?.pages,
			results,
		},
	};
};

export default usePlugins;
