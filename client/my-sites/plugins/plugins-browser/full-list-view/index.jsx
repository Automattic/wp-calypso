import InfiniteScroll from 'calypso/components/infinite-scroll';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import ClearSearchButton from '../clear-search-button';

const FullListView = ( prop ) => {
	return (
		<>
			<PluginsBrowserList
				plugins={ prop.plugins }
				listName={ prop.listName }
				subtitle={
					<>
						{ prop.title }
						<ClearSearchButton />
					</>
				}
				site={ prop.siteSlug }
				showPlaceholders={ prop.isFetching }
				currentSites={ prop.sites }
				variant={ PluginsBrowserListVariant.InfiniteScroll }
				extended
			/>

			<InfiniteScroll nextPageMethod={ prop.fetchNextPage } />
		</>
	);
};

export default FullListView;
