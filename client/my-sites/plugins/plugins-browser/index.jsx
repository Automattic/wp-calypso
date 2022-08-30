import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QueryProductsList from 'calypso/components/data/query-products-list';
import MainComponent from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import useScrollAboveElement from 'calypso/lib/use-scroll-above-element';
import Categories from 'calypso/my-sites/plugins/categories';
import { useCategories } from 'calypso/my-sites/plugins/categories/use-categories';
import EducationFooter from 'calypso/my-sites/plugins/education-footer';
import NoPermissionsError from 'calypso/my-sites/plugins/no-permissions-error';
import PluginsAnnouncementModal from 'calypso/my-sites/plugins/plugins-announcement-modal';
import SearchBoxHeader from 'calypso/my-sites/plugins/search-box-header';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getSelectedOrAllSitesJetpackCanManage from 'calypso/state/selectors/get-selected-or-all-sites-jetpack-can-manage';
import { isRequestingSites } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import JetpackDisconnectedNotice from '../jetpack-disconnected-notice';
import PluginsCategoryResultsPage from '../plugins-category-results-page';
import PluginsDiscoveryPage from '../plugins-discovery-page';
import PluginsNavigationHeader from '../plugins-navigation-header';
import PluginsSearchResultPage from '../plugins-search-results-page';
import './style.scss';

const PageViewTrackerWrapper = ( { category, selectedSiteId, trackPageViews } ) => {
	const analyticsPageTitle = 'Plugin Browser' + category ? ` > ${ category }` : '';
	let analyticsPath = category ? `/plugins/browse/${ category }` : '/plugins';

	if ( selectedSiteId ) {
		analyticsPath += '/:site';
	}

	if ( trackPageViews ) {
		return <PageViewTracker path={ analyticsPath } title={ analyticsPageTitle } />;
	}

	return null;
};

const PluginsBrowser = ( { trackPageViews = true, category, search, hideHeader } ) => {
	const {
		isAboveElement,
		targetRef: searchHeaderRef,
		referenceRef: navigationHeaderRef,
	} = useScrollAboveElement();

	// temporary solution to use same isFetching in search header & in component.
	const [ isFetchingPluginsBySearchTerm, setIsFetchingPluginsBySearchTerm ] = useState( false );

	const renderList = () => {
		if ( search ) {
			return (
				<PluginsSearchResultPage
					search={ search }
					setIsFetchingPluginsBySearchTerm={ setIsFetchingPluginsBySearchTerm }
				/>
			);
		}

		if ( category ) {
			return <PluginsCategoryResultsPage category={ category } />;
		}

		return <PluginsDiscoveryPage />;
	};

	const searchRef = useRef( null );

	const selectedSite = useSelector( getSelectedSite );

	const isRequestingSitesData = useSelector( isRequestingSites );
	const noPermissionsError = useSelector(
		( state ) =>
			!! selectedSite?.ID && ! canCurrentUser( state, selectedSite?.ID, 'manage_options' )
	);
	const sites = useSelector( getSelectedOrAllSitesJetpackCanManage );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sites ) ) ];

	const translate = useTranslate();

	const categories = useCategories();
	const categoryName = categories[ category ]?.name || translate( 'Plugins' );

	if ( ! isRequestingSitesData && noPermissionsError ) {
		return <NoPermissionsError title={ translate( 'Plugins', { textOnly: true } ) } />;
	}

	return (
		<MainComponent wideLayout>
			<QueryProductsList persist />
			<QueryJetpackPlugins siteIds={ siteIds } />
			<PageViewTrackerWrapper
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
					search={ search }
				/>
			) }
			<JetpackDisconnectedNotice />
			<SearchBoxHeader
				searchRef={ searchRef }
				popularSearchesRef={ searchHeaderRef }
				isSticky={ isAboveElement }
				searchTerm={ search }
				isSearching={ isFetchingPluginsBySearchTerm }
				title={ translate( 'Plugins you need to get your projects done' ) }
				searchTerms={ [ 'seo', 'pay', 'booking', 'ecommerce', 'newsletter' ] }
			/>

			{ ! search && <Categories selected={ category } /> }
			<div className="plugins-browser__main-container">{ renderList() }</div>
			{ ! category && ! search && <EducationFooter /> }
		</MainComponent>
	);
};

export default PluginsBrowser;
