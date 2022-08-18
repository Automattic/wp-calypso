import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QueryProductsList from 'calypso/components/data/query-products-list';
import MainComponent from 'calypso/components/main';
import useScrollAboveElement from 'calypso/lib/use-scroll-above-element';
import { useCategories } from 'calypso/my-sites/plugins/categories/use-categories';
import JetpackDisconnectedNotice from 'calypso/my-sites/plugins/jetpack-disconnected-notice';
import PluginsAnnouncementModal from 'calypso/my-sites/plugins/plugins-announcement-modal';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import PluginsNavigationHeader from 'calypso/my-sites/plugins/plugins-navigation-header';
import PluginsPageViewTracker from 'calypso/my-sites/plugins/plugins-page-view-tracker';
import SearchBoxHeader from 'calypso/my-sites/plugins/search-box-header';
import usePlugins from 'calypso/my-sites/plugins/use-plugins';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import getSelectedOrAllSitesJetpackCanManage from 'calypso/state/selectors/get-selected-or-all-sites-jetpack-can-manage';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import Categories from '../categories';
import FullListView from '../plugins-browser/full-list-view';

// We should break this styles in a subsequent PR
import '../plugins-browser/style.scss';

const PluginsCategoryResultList = ( { category, categoryName, selectedSite, sites } ) => {
	const { plugins, isFetching, fetchNextPage, pagination } = usePlugins( {
		category,
		infinite: true,
	} );
	const translate = useTranslate();

	let title = '';
	if ( categoryName && pagination ) {
		title = translate( '%(total)s plugin', '%(total)s plugins', {
			count: pagination.results,
			textOnly: true,
			args: {
				total: pagination.results,
			},
		} );
	}

	return (
		<FullListView
			plugins={ plugins }
			listName={ category }
			title={ title }
			site={ selectedSite?.slug }
			showPlaceholders={ isFetching }
			sites={ sites }
			variant={ PluginsBrowserListVariant.InfiniteScroll }
			fetchNextPage={ fetchNextPage }
			extended
		/>
	);
};

const PluginsCategoryResultsPage = ( { trackPageViews = true, category, hideHeader } ) => {
	const translate = useTranslate();
	const {
		isAboveElement,
		targetRef: searchHeaderRef,
		referenceRef: navigationHeaderRef,
	} = useScrollAboveElement();
	const searchRef = useRef( null );

	const selectedSite = useSelector( getSelectedSite );
	const sites = useSelector( getSelectedOrAllSitesJetpackCanManage );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sites ) ) ];

	const categories = useCategories();

	const categoryName = categories[ category ]?.name || translate( 'Plugins' );

	return (
		<MainComponent wideLayout>
			<QueryProductsList persist />
			<QueryJetpackPlugins siteIds={ siteIds } />
			<PluginsPageViewTracker
				category={ category }
				selectedSiteId={ selectedSite?.ID }
				trackPageViews={ trackPageViews }
			/>
			<DocumentHead title={ translate( 'Plugins' ) } />

			<PluginsAnnouncementModal />
			{ ! hideHeader && (
				<PluginsNavigationHeader
					navigationHeaderRef={ navigationHeaderRef }
					categoryName={ categoryName }
					category={ category }
				/>
			) }
			<JetpackDisconnectedNotice />
			<SearchBoxHeader
				searchRef={ searchRef }
				popularSearchesRef={ searchHeaderRef }
				isSticky={ isAboveElement }
				title={ translate( 'Plugins you need to get your projects done' ) }
				searchTerms={ [ 'seo', 'pay', 'booking', 'ecommerce', 'newsletter' ] }
			/>

			<Categories selected={ category } />
			<div className="plugins-browser__main-container">
				{
					<PluginsCategoryResultList
						selectedSite={ selectedSite }
						categoryName={ categoryName }
						category={ category }
						sites={ sites }
					/>
				}
			</div>
		</MainComponent>
	);
};

export default PluginsCategoryResultsPage;
