import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { DEFAULT_PAGE_SIZE } from 'calypso/data/marketplace/constants';
import { getPluginsPage } from 'calypso/data/marketplace/pagination';
import { Plugin } from 'calypso/data/marketplace/types';
import { useESPlugins, useESPluginsInfinite } from 'calypso/data/marketplace/use-es-query';
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
	fetchNextPage?: () => void;
	hasNextPage?: boolean;
}

interface WPCOMResponse {
	data?: Plugin[];
	isLoading: boolean;
	fetchNextPage?: () => void;
	isError: boolean;
	refetch: () => void;
}

const usePlugins = ( {
	category,
	search,
	infinite = false,
	locale = '',
	slugs,
	page,
}: {
	category: string;
	search?: string;
	infinite?: boolean;
	locale?: string;
	slugs?: string[];
	page?: number;
} ) => {
	let plugins = [];
	let isFetching = false;
	let results = 0;

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
	};

	// This is triggered for searches OR any other category than paid, featured
	const {
		data: { plugins: ESPlugins = [], pagination: ESPagination } = {},
		isLoading: isFetchingES,
		fetchNextPage,
		hasNextPage,
	} = useESPluginsInfinite( wporgPluginsOptions, {
		enabled: page === undefined && ( !! search || ! [ 'paid', 'featured ' ].includes( category ) ),
	} ) as ESResponse;

	const pagedPlugins = useESPlugins(
		{ ...wporgPluginsOptions, page },
		{
			enabled: page !== undefined && ! [ 'paid', 'featured' ].includes( category ),
		}
	);

	// This is triggered only for paid plugins lists.
	const paidPluginsQuery = useWPCOMPluginsList(
		config.isEnabled( 'marketplace-fetch-all-dynamic-products' ) ? 'all' : 'launched',
		search,
		tag,
		{
			enabled: category === 'paid',
		}
	) as WPCOMResponse;
	const { data: dotComPlugins = [], isLoading: isFetchingDotCom } = paidPluginsQuery;

	// This is triggered only for featured plugins list in discover page.
	const featuredPluginsQuery = useWPCOMFeaturedPlugins( {
		enabled: category === 'featured',
	} ) as WPCOMResponse;
	const { data: featuredPlugins = [], isLoading: isFetchingDotComFeatured } = featuredPluginsQuery;

	if ( page !== undefined ) {
		if ( category !== 'paid' && category !== 'featured' ) {
			return {
				plugins: pagedPlugins.data?.plugins ?? [],
				isFetching: pagedPlugins.isLoading,
				isError: pagedPlugins.isError,
				retry: pagedPlugins.refetch,
				fetchNextPage: () => {},
				pagination: pagedPlugins.data?.pagination ?? {
					page: getPluginsPage( page ),
					pages: 0,
					results: 0,
				},
			};
		}

		const query = category === 'paid' ? paidPluginsQuery : featuredPluginsQuery;
		const allPlugins = query.data ?? [];
		const currentPage = getPluginsPage( page );
		const offset = ( currentPage - 1 ) * DEFAULT_PAGE_SIZE;
		return {
			plugins: allPlugins.slice( offset, offset + DEFAULT_PAGE_SIZE ),
			isFetching: query.isLoading,
			isError: query.isError,
			retry: query.refetch,
			fetchNextPage: () => {},
			pagination: {
				page: currentPage,
				pages: Math.ceil( allPlugins.length / DEFAULT_PAGE_SIZE ),
				results: allPlugins.length,
			},
		};
	}

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
			plugins = ESPlugins;
			isFetching = isFetchingES;
			results = ESPagination?.results ?? 0;

			break;
	}

	function fetchNextPageAndStop() {
		if ( ! infinite || ! hasNextPage ) {
			return;
		}

		fetchNextPage?.();
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
