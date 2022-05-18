import { isEnabled } from '@automattic/calypso-config';
import { useMemo } from 'react';
import { Plugin } from 'calypso/data/marketplace/types';
import { useSiteSearchPlugins } from 'calypso/data/marketplace/use-site-search-es-query';
import {
	useWPCOMFeaturedPlugins,
	useWPCOMPlugins,
} from 'calypso/data/marketplace/use-wpcom-plugins-query';
import {
	useWPORGInfinitePlugins,
	useWPORGPlugins,
} from 'calypso/data/marketplace/use-wporg-plugin-query';
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
	if ( ! plugin || ! plugin.rating ) return plugin;

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
	const categoryTags = categories[ category || '' ]?.tags || [];
	const tag = categoryTags.join( ',' );

	const searchHook =
		isEnabled( 'marketplace-jetpack-plugin-search' ) && search
			? useSiteSearchPlugins
			: useWPORGInfinitePlugins;

	const wporgPluginsOptions = {
		locale,
		category,
		tag,
		searchTerm: search,
	};

	const {
		data: { plugins: wporgPlugins = [], pagination: wporgPagination } = {},
		isLoading: isFetchingWPORG,
	} = useWPORGPlugins( wporgPluginsOptions, {
		enabled: ! infinite && ! WPORG_CATEGORIES_BLOCKLIST.includes( category || '' ) && wporgEnabled,
	} ) as WPORGResponse;

	const {
		data: { plugins: wporgPluginsInfinite = [], pagination: wporgPaginationInfinite } = {},
		isLoading: isFetchingWPORGInfinite,
		fetchNextPage,
	} = searchHook( wporgPluginsOptions, {
		enabled: infinite && WPORG_CATEGORIES_BLOCKLIST.includes( category || '' ) && wporgEnabled,
	} ) as WPORGResponse;

	const dotOrgPlugins = infinite ? wporgPluginsInfinite : wporgPlugins;
	const isFetchingDotOrg = infinite ? isFetchingWPORGInfinite : isFetchingWPORG;
	const dotOrgPagination = infinite ? wporgPaginationInfinite : wporgPagination;

	const { data: wpcomPluginsRaw = [], isLoading: isFetchingDotCom } = useWPCOMPlugins(
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
			plugins = dotOrgPlugins;
			isFetching = isFetchingDotOrg;
			results = dotOrgPagination?.results ?? 0;
			break;
		case 'featured':
			plugins = featuredPlugins;
			isFetching = isFetchingDotComFeatured;
			results = featuredPlugins?.length ?? 0;
			break;
		default:
			plugins = [ ...dotComPlugins, ...dotOrgPlugins ];
			isFetching = isFetchingDotCom || isFetchingDotOrg;
			results = ( dotOrgPagination?.results ?? 0 ) + dotComPlugins.length;
			break;
	}

	function fetchNextPageAndStop() {
		if (
			dotOrgPagination?.page &&
			dotOrgPagination?.pages &&
			dotOrgPagination.page >= dotOrgPagination.pages
		) {
			return;
		}

		fetchNextPage && fetchNextPage();
	}

	return {
		plugins,
		isFetching,
		fetchNextPage: fetchNextPageAndStop,
		pagination: {
			page: dotOrgPagination?.page,
			pages: dotOrgPagination?.pages,
			results,
		},
	};
};

export default usePlugins;
