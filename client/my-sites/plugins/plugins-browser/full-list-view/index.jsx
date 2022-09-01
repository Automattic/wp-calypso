import InfiniteScroll from 'calypso/components/infinite-scroll';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';

const FullListView = ( props ) => {
	return (
		<>
			<PluginsBrowserList
				plugins={ props.plugins }
				listName={ props.listName }
				site={ props.site }
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
