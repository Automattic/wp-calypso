import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useCategories } from 'calypso/my-sites/plugins/categories/use-categories';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { getPlugins, isEqualSlugOrId } from 'calypso/state/plugins/installed/selectors';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Module variables
 */
const SHORT_LIST_LENGTH = 6;

const PLUGIN_SLUGS_BLOCKLIST = [];

function isNotBlocked( plugin ) {
	return PLUGIN_SLUGS_BLOCKLIST.indexOf( plugin.slug ) === -1;
}

/**
 * Returns a boolean indicating if a plugin is already installed or not
 *
 * @param plugin plugin object to be tested
 * @param installedPlugins list of installed plugins aggregated by plugin slug
 * @returns Boolean weather a plugin is not installed on not
 */
function isNotInstalled( plugin, installedPlugins ) {
	return ! installedPlugins.find( ( installedPlugin ) =>
		isEqualSlugOrId( plugin.slug, installedPlugin )
	);
}

const SingleListView = ( {
	category,
	pluginsByCategoryPopular,
	isFetchingPluginsByCategoryPopular,
	pluginsByCategoryFeatured,
	isFetchingPluginsByCategoryFeatured,
	paidPlugins,
	isFetchingPaidPlugins,
	siteSlug,
	sites,
} ) => {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );

	const categories = useCategories();
	const categoryName = categories[ category ]?.name || translate( 'Plugins' );

	const installedPlugins = useSelector( ( state ) =>
		getPlugins( state, siteObjectsToSiteIds( sites ) )
	);

	let plugins;
	let isFetching;
	if ( category === 'popular' ) {
		plugins = pluginsByCategoryPopular;
		isFetching = isFetchingPluginsByCategoryPopular;
	} else if ( category === 'featured' ) {
		plugins = pluginsByCategoryFeatured;
		isFetching = isFetchingPluginsByCategoryFeatured;
	} else if ( category === 'paid' ) {
		plugins = paidPlugins;
		isFetching = isFetchingPaidPlugins;
	} else {
		return null;
	}

	plugins = plugins
		.filter( isNotBlocked )
		.filter( ( plugin ) => isNotInstalled( plugin, installedPlugins ) );

	let listLink = '/plugins/browse/' + category;
	if ( domain ) {
		listLink = '/plugins/browse/' + category + '/' + domain;
	}

	if ( ! isFetching && plugins.length === 0 ) {
		return null;
	}

	return (
		<PluginsBrowserList
			plugins={ plugins.slice( 0, SHORT_LIST_LENGTH ) }
			listName={ category }
			title={ categoryName }
			site={ siteSlug }
			expandedListLink={ plugins.length > SHORT_LIST_LENGTH ? listLink : false }
			size={ SHORT_LIST_LENGTH }
			showPlaceholders={ isFetching }
			currentSites={ sites }
			variant={ PluginsBrowserListVariant.Fixed }
			extended
		/>
	);
};

export default SingleListView;
