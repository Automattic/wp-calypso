import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryPlugins from 'calypso/components/data/query-plugins';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { JetpackConnectionHealthBanner } from 'calypso/components/jetpack/connection-health';
import MainComponent from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import useScrollAboveElement from 'calypso/lib/use-scroll-above-element';
import { useCategories } from 'calypso/my-sites/plugins/categories/use-categories';
import { MarketplaceFooter } from 'calypso/my-sites/plugins/education-footer';
import NoPermissionsError from 'calypso/my-sites/plugins/no-permissions-error';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { useIsJetpackConnectionProblem } from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-problem';
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
import PluginsCategoryResultsPage from '../plugins-category-results-page';
import PluginsDiscoveryPage from '../plugins-discovery-page';
import PluginsNavigationHeader from '../plugins-navigation-header';
import PluginsSearchResultPage from '../plugins-search-results-page';
import SearchCategories from '../search-categories';

import './style.scss';

const searchTerms = [ 'woocommerce', 'seo', 'file manager', 'jetpack', 'ecommerce', 'form' ];

const PageViewTrackerWrapper = ( { category, selectedSiteId, trackPageViews, isLoggedIn } ) => {
	const analyticsPageTitle = 'Plugin Browser' + category ? ` > ${ category }` : '';
	let analyticsPath = category ? `/plugins/browse/${ category }` : '/plugins';

	if ( selectedSiteId ) {
		analyticsPath += '/:site';
	}

	if ( trackPageViews ) {
		return (
			<PageViewTracker
				path={ analyticsPath }
				title={ analyticsPageTitle }
				properties={ { is_logged_in: isLoggedIn } }
			/>
		);
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
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const isRequestingSitesData = useSelector( isRequestingSites );
	const noPermissionsError = useSelector(
		( state ) =>
			!! selectedSite?.ID && ! canCurrentUser( state, selectedSite?.ID, 'manage_options' )
	);
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const isPossibleJetpackConnectionProblem = useIsJetpackConnectionProblem( siteId );
	const sites = useSelector( getSelectedOrAllSitesJetpackCanManage );
	const isLoggedIn = useSelector( isUserLoggedIn );

	const { __ } = useI18n();
	const translate = useTranslate();

	const categories = useCategories();
	const categoryName = categories[ category ]?.menu || __( 'Plugins' );

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
		<MainComponent
			className={ clsx( 'plugins-browser', {
				'plugins-browser--site-view': !! selectedSite,
			} ) }
			wideLayout
			isLoggedOut={ ! isLoggedIn }
		>
			<QueryProductsList persist />
			<QueryPlugins siteId={ selectedSite?.ID } />
			<QuerySitePurchases siteId={ selectedSite?.ID } />
			<PageViewTrackerWrapper
				category={ category }
				selectedSiteId={ selectedSite?.ID }
				trackPageViews={ trackPageViews }
				isLoggedIn={ isLoggedIn }
			/>
			<DocumentHead
				title={
					category && ! search
						? translate( '%(categoryName)s Plugins', { args: { categoryName } } )
						: translate( 'Plugins' )
				}
			/>

			{ ! hideHeader && (
				<PluginsNavigationHeader
					navigationHeaderRef={ navigationHeaderRef }
					categoryName={ categoryName }
					category={ category }
					search={ search }
				/>
			) }
			<div className="plugins-browser__content-wrapper">
				{ selectedSite && isJetpack && isPossibleJetpackConnectionProblem && (
					<JetpackConnectionHealthBanner siteId={ siteId } />
				) }
				<SearchCategories
					category={ category }
					isSearching={ isFetchingPluginsBySearchTerm }
					isSticky={ isAboveElement }
					searchRef={ searchRef }
					searchTerm={ search }
					searchTerms={ searchTerms }
					stickySearchBoxRef={ searchHeaderRef }
				/>
				<div className="plugins-browser__main-container">{ renderList() }</div>
				{ ! category && ! search && (
					<div className="plugins-browser__marketplace-footer">
						<MarketplaceFooter />
					</div>
				) }
			</div>
		</MainComponent>
	);
};

export default PluginsBrowser;
