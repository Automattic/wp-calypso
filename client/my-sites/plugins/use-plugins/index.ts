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
	fetchNextPage?: () => void;
	hasNextPage?: boolean;
}

interface WPCOMResponse {
	data?: Plugin[];
	isLoading: boolean;
	fetchNextPage?: () => void;
}

const usePlugins = ( {
	category,
	search,
	infinite = false,
	locale = '',
	slugs,
}: {
	category: string;
	search?: string;
	infinite?: boolean;
	locale?: string;
	slugs?: string[];
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
		enabled: !! search || ! [ 'paid', 'featured ' ].includes( category ),
	} ) as ESResponse;

	// This is triggered only for paid plugins lists.
	const { data: dotComPlugins = [], isLoading: isFetchingDotCom } = useWPCOMPluginsList(
		config.isEnabled( 'marketplace-fetch-all-dynamic-products' ) ? 'all' : 'launched',
		search,
		tag,
		{
			enabled: category === 'paid',
		}
	) as WPCOMResponse;

	// This is triggered only for featured plugins list in discover page.
	const { data: featuredPlugins = [], isLoading: isFetchingDotComFeatured } =
		useWPCOMFeaturedPlugins( {
			enabled: category === 'featured',
		} ) as WPCOMResponse;

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
