import { useMemo } from 'react';
import {
	useWPCOMFeaturedPlugins,
	useWPCOMPlugins,
} from 'calypso/data/marketplace/use-wpcom-plugins-query';
import {
	useWPORGInfinitePlugins,
	useWPORGPlugins,
} from 'calypso/data/marketplace/use-wporg-plugin-query';
import { useCategories } from '../categories/use-categories';

/**
 * Multiply the wpcom rating to match the wporg value.
 * wpcom rating is from 1 to 5 while wporg is from 1 to 100.
 *
 * @param plugin
 * @returns
 */
function updateWpComRating( plugin: any ) {
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
	category?: string;
	search?: string;
	infinite?: boolean;
	locale?: string;
	wporgEnabled?: boolean;
	wpcomEnabled?: boolean;
} ) => {
	let plugins = [];
	let isFetching = false;

	const categories = useCategories();
	const categoryTags = categories[ category || '' ]?.tags || [];
	const tag = categoryTags.join( '' );

	const wporgPluginsOptions = {
		locale,
		category,
		tag,
		search,
	};

	const { data: { plugins: wporgPlugins = [] } = {}, isLoading: isFetchingWPORG } = useWPORGPlugins(
		wporgPluginsOptions,
		{
			enabled: ! infinite && WPORG_CATEGORIES_BLOCKLIST.includes( category || '' ) && wporgEnabled,
		}
	);

	const {
		data: { plugins: wporgPluginsInfinite = [] } = {},
		isLoading: isFetchingWPORGInfinite,
		fetchNextPage,
	} = useWPORGInfinitePlugins( wporgPluginsOptions, {
		enabled: infinite && WPORG_CATEGORIES_BLOCKLIST.includes( category || '' ) && wporgEnabled,
	} );

	const dotOrgPlugins = infinite ? wporgPluginsInfinite : wporgPlugins;
	const isFetchingDotOrg = infinite ? isFetchingWPORGInfinite : isFetchingWPORG;

	const { data: wpcomPluginsRaw = [], isLoading: isFetchingDotCom } = useWPCOMPlugins(
		'all',
		search,
		tag,
		{
			enabled: WPCOM_CATEGORIES_BLOCKLIST.includes( category || '' ) && wpcomEnabled,
		}
	);

	const {
		data: featuredPluginsRaw = [],
		isLoading: isFetchingDotComFeatured,
	} = useWPCOMFeaturedPlugins( {
		enabled: category === 'featured' && wpcomEnabled,
	} );

	const featuredPlugins = useMemo( () => featuredPluginsRaw.map( updateWpComRating ), [
		featuredPluginsRaw,
	] );

	const dotComPlugins = useMemo( () => wpcomPluginsRaw.map( updateWpComRating ), [
		wpcomPluginsRaw,
	] );

	switch ( category ) {
		case 'paid':
			plugins = dotComPlugins;
			isFetching = isFetchingDotCom;
			break;
		case 'popular':
			plugins = dotOrgPlugins;
			isFetching = isFetchingDotOrg;
			break;
		case 'featured':
			isFetching = isFetchingDotComFeatured;
			plugins = featuredPlugins;
			break;
		default:
			plugins = [ ...dotComPlugins, ...dotOrgPlugins ];
			isFetching = isFetchingDotCom || isFetchingDotOrg;
			break;
	}

	return {
		plugins,
		isFetching,
		fetchNextPage,
	};
};

export default usePlugins;
