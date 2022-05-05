import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';

const SHORT_LIST_LENGTH = 6;

const PluginListView = ( {
	compact,
	plugins,
	categoryName,
	siteSlug,
	isFetching,
	fetchNextPage,
	category,
	domain,
	setBillingPeriod,
} ) => {
	const pluginsList = compact ? plugins.slice( 0, SHORT_LIST_LENGTH ) : plugins;
	const title = compact ? '' : categoryName; // test to see if this is the same as category
	const size = compact ? SHORT_LIST_LENGTH : undefined;
	const variant = compact
		? PluginsBrowserListVariant.Fixed
		: PluginsBrowserListVariant.InfiniteScroll;
	const listLink = '/plugins/' + category + '/' + domain;
	const shouldShowListLink = plugins.length > SHORT_LIST_LENGTH && compact;
	const expandedListLink = shouldShowListLink ? listLink : false;
	
	return (
		<>
			<PluginsBrowserList
				plugins={ pluginsList.filter( isNotBlocked ) }
				listName={ category }
				title={ title }
				site={ siteSlug }
				expandedListLink={ expandedListLink }
				size={ size }
				showPlaceholders={ isFetching }
				variant={ variant }
				billingPeriod={ billingPeriod }
				setBillingPeriod={ isPaidCategory && setBillingPeriod }
				extended
			/>

			{ compact && <InfiniteScroll nextPageMethod={ fetchNextPage } /> }
		</>
	);
};
