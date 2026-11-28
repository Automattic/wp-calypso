import { isGeneratedPluginIcon } from '@automattic/api-core';
import { useWpOrgPluginIcons } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { Plugin } from 'calypso/data/marketplace/types';
import { useESPluginsInfinite } from 'calypso/data/marketplace/use-es-query';
import {
	useWPCOMFeaturedPlugins,
	useWPCOMPluginsList,
} from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { useCategories } from '../categories/use-categories';

interface ESResponse {
	data?: {
		plugins: Plugin[];
		pagination: {
			results: number;
			page: number;
			pages: number;
		};
	};
	isLoading: boolean;
	isSuccess: boolean;
	fetchNextPage?: () => void;
	hasNextPage?: boolean;
}

interface WPCOMResponse {
	data?: Plugin[];
	isLoading: boolean;
	isSuccess: boolean;
	fetchNextPage?: () => void;
}

const usePlugins = ( {
	category,
	search,
	infinite = false,
	locale = '',
	slugs,
	page,
	staleTime,
}: {
	category: string;
	search?: string;
	infinite?: boolean;
	locale?: string;
	slugs?: string[];
	page?: number;
	staleTime?: number;
} ) => {
	let plugins;
	let isFetching;
	let isSuccess;
	let results;

	const categories = useCategories();
	const categoryTags = categories[ category || '' ]?.tags || [ category ];
	const tag = categoryTags.join( ',' );

	const translate = useTranslate();
	const wporgPluginsOptions = {
		locale: locale || ( translate.localeSlug as string ),
		category,
		tag,
		searchTerm: search,
		slugs,
		page: page && page > 1 ? page : undefined,
	};

	// This is triggered for searches OR any other category than paid, featured
	const {
		data: { plugins: ESPlugins = [], pagination: ESPagination } = {},
		isLoading: isFetchingES,
		isSuccess: isSuccessES,
		fetchNextPage,
		hasNextPage,
	} = useESPluginsInfinite( wporgPluginsOptions, {
		enabled: !! search || ! [ 'paid', 'featured' ].includes( category ),
		staleTime,
	} ) as ESResponse;

	// This is triggered only for paid plugins lists.
	const {
		data: dotComPlugins = [],
		isLoading: isFetchingDotCom,
		isSuccess: isSuccessDotCom,
	} = useWPCOMPluginsList(
		config.isEnabled( 'marketplace-fetch-all-dynamic-products' ) ? 'all' : 'launched',
		search,
		tag,
		{
			enabled: category === 'paid',
		}
	) as WPCOMResponse;

	// This is triggered only for featured plugins list in discover page.
	const {
		data: featuredPlugins = [],
		isLoading: isFetchingDotComFeatured,
		isSuccess: isSuccessDotComFeatured,
	} = useWPCOMFeaturedPlugins( {
		enabled: category === 'featured',
	} ) as WPCOMResponse;

	switch ( category ) {
		case 'paid':
			plugins = dotComPlugins;
			isFetching = isFetchingDotCom;
			isSuccess = isSuccessDotCom;
			results = dotComPlugins?.length ?? 0;
			break;
		case 'popular':
			plugins = ESPlugins;
			isFetching = isFetchingES;
			isSuccess = isSuccessES;
			results = ESPagination?.results ?? 0;
			break;
		case 'featured':
			plugins = featuredPlugins;
			isFetching = isFetchingDotComFeatured;
			isSuccess = isSuccessDotComFeatured;
			results = featuredPlugins?.length ?? 0;
			break;
		default:
			plugins = ESPlugins;
			isFetching = isFetchingES;
			isSuccess = isSuccessES;
			results = ESPagination?.results ?? 0;

			break;
	}

	// The search index only has a generated pattern for wp.org plugins (SEARCH-333).
	const wpOrgIcons = useWpOrgPluginIcons(
		plugins
			.filter( ( plugin: Plugin ) => isGeneratedPluginIcon( plugin.icon ) )
			.map( ( plugin: Plugin ) => plugin.slug )
	);

	plugins = plugins.map( ( plugin: Plugin ) =>
		wpOrgIcons[ plugin.slug ] ? { ...plugin, icon: wpOrgIcons[ plugin.slug ] } : plugin
	);

	function fetchNextPageAndStop() {
		if ( ! infinite || ! hasNextPage ) {
			return;
		}

		fetchNextPage?.();
	}

	return {
		plugins,
		isFetching,
		isSuccess,
		fetchNextPage: fetchNextPageAndStop,
		hasNextPage: !! hasNextPage,
		pagination: {
			page: ESPagination?.page,
			pages: ESPagination?.pages,
			results,
		},
	};
};

export default usePlugins;
