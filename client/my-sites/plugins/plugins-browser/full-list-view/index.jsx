import InfiniteScroll from 'calypso/components/infinite-scroll';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import ClearSearchButton from '../clear-search-button';

const FullListView = ( props ) => {
	return (
		<>
			<PluginsBrowserList
				plugins={ props.plugins }
				listName={ props.listName }
				subtitle={
					<>
						{ props.title }
						<ClearSearchButton />
					</>
				}
				site={ props.siteSlug }
				showPlaceholders={ props.isFetching }
				currentSites={ props.sites }
				variant={ PluginsBrowserListVariant.InfiniteScroll }
				extended
			/>

			<InfiniteScroll nextPageMethod={ props.fetchNextPage } />
		</>
	);
};

export default FullListView;
