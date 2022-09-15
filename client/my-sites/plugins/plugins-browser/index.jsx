import { useLocale } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryAllJetpackSitesPlugins from 'calypso/components/data/query-all-jetpack-sites-plugins';
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
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getSelectedOrAllSitesJetpackCanManage from 'calypso/state/selectors/get-selected-or-all-sites-jetpack-can-manage';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getSitePlan, isJetpackSite, isRequestingSites } from 'calypso/state/sites/selectors';
import {
	getSelectedSiteId,
	getSelectedSite,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
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
	const searchRef = useRef( null );
	//  another temporary solution until phase 4 is merged
	const [ isFetchingPluginsBySearchTerm, setIsFetchingPluginsBySearchTerm ] = useState( false );

	const selectedSite = useSelector( getSelectedSite );
	const sitePlan = useSelector( ( state ) => getSitePlan( state, selectedSite?.ID ) );

	const jetpackNonAtomic = useSelector(
		( state ) =>
			isJetpackSite( state, selectedSite?.ID ) && ! isAtomicSite( state, selectedSite?.ID )
	);

	const isVip = useSelector( ( state ) => isVipSite( state, selectedSite?.ID ) );
	const isRequestingSitesData = useSelector( isRequestingSites );
	const noPermissionsError = useSelector(
		( state ) =>
			!! selectedSite?.ID && ! canCurrentUser( state, selectedSite?.ID, 'manage_options' )
	);
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const sites = useSelector( getSelectedOrAllSitesJetpackCanManage );

	const { __, hasTranslation } = useI18n();
	const locale = useLocale();

	const categories = useCategories();
	const categoryName = categories[ category ]?.name || __( 'Plugins' );

	// this is a temporary hack until we merge Phase 4 of the refactor
	const renderList = () => {
		if ( search ) {
			return (
				<PluginsSearchResultPage
					search={ search }
					setIsFetchingPluginsBySearchTerm={ setIsFetchingPluginsBySearchTerm }
					siteSlug={ siteSlug }
					siteId={ siteId }
					sites={ sites }
				/>
			);
		}

		if ( category ) {
			return (
				<PluginsCategoryResultsPage category={ category } sites={ sites } siteSlug={ siteSlug } />
			);
		}

		return (
			<PluginsDiscoveryPage
				siteSlug={ siteSlug }
				jetpackNonAtomic={ jetpackNonAtomic }
				selectedSite={ selectedSite }
				sitePlan={ sitePlan }
				isVip={ isVip }
				sites={ sites }
			/>
		);
	};

	if ( ! isRequestingSitesData && noPermissionsError ) {
		return <NoPermissionsError title={ __( 'Plugins' ) } />;
	}

	return (
		<MainComponent wideLayout>
			<QueryProductsList persist />
			{ selectedSite ? (
				<QueryJetpackPlugins siteIds={ [ selectedSite.ID ] } />
			) : (
				<QueryAllJetpackSitesPlugins />
			) }
			<PageViewTrackerWrapper
				category={ category }
				selectedSiteId={ selectedSite?.ID }
				trackPageViews={ trackPageViews }
			/>
			<DocumentHead title={ __( 'Plugins' ) } />

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
				title={
					'en' === locale || hasTranslation( 'Flex your site’s features with plugins' )
						? __( 'Flex your site’s features with plugins' )
						: __( 'Plugins you need to get your projects done' )
				}
				searchTerms={ [ 'seo', 'pay', 'booking', 'ecommerce', 'newsletter' ] }
			/>

			{ ! search && <Categories selected={ category } /> }
			<div className="plugins-browser__main-container">{ renderList() }</div>
			{ ! category && ! search && <EducationFooter /> }
		</MainComponent>
	);
};

export default PluginsBrowser;
