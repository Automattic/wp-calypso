/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flow, get } from 'lodash';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import DocumentHead from 'calypso/components/data/document-head';
import Search from '@automattic/search';
import SectionNav from 'calypso/components/section-nav';
import MainComponent from 'calypso/components/main';
import NavTabs from 'calypso/components/section-nav/tabs';
import NavItem from 'calypso/components/section-nav/item';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import NoResults from 'calypso/my-sites/no-results';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import urlSearch from 'calypso/lib/url-search';
import { recordTracksEvent, recordGoogleEvent } from 'calypso/state/analytics/actions';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import getSelectedOrAllSitesJetpackCanManage from 'calypso/state/selectors/get-selected-or-all-sites-jetpack-can-manage';
import getRecommendedPlugins from 'calypso/state/selectors/get-recommended-plugins';
import hasJetpackSites from 'calypso/state/selectors/has-jetpack-sites';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import { getSitePlan, isJetpackSite, isRequestingSites } from 'calypso/state/sites/selectors';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import NoPermissionsError from 'calypso/my-sites/plugins/no-permissions-error';
import { Button } from '@automattic/components';
import {
	isBusiness,
	isEcommerce,
	isEnterprise,
	isPremium,
	findFirstSimilarPlanKey,
	FEATURE_UPLOAD_PLUGINS,
	TYPE_BUSINESS,
} from '@automattic/calypso-products';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { isEnabled } from '@automattic/calypso-config';
import QuerySiteRecommendedPlugins from 'calypso/components/data/query-site-recommended-plugins';
import QueryWporgPlugins from 'calypso/components/data/query-wporg-plugins';
import {
	getPluginsListByCategory,
	getPluginsListBySearchTerm,
	isFetchingPluginsList,
} from 'calypso/state/plugins/wporg/selectors';
import { fetchPluginsCategoryNextPage } from 'calypso/state/plugins/wporg/actions';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Module variables
 */
const SHORT_LIST_LENGTH = 6;
const VISIBLE_CATEGORIES = [ 'new', 'popular', 'featured' ];
const VISIBLE_CATEGORIES_FOR_RECOMMENDATIONS = [ 'new', 'popular' ];

export class PluginsBrowser extends Component {
	static propTypes = {
		isRequestingRecommendedPlugins: PropTypes.bool.isRequired,
		recommendedPlugins: PropTypes.arrayOf( PropTypes.object ),
		selectedSite: PropTypes.object,
		trackPageView: PropTypes.bool,
		hideHeader: PropTypes.bool,
	};

	static defaultProps = {
		trackPageViews: true,
	};

	reinitializeSearch() {
		this.WrappedSearch = ( props ) => <Search { ...props } />;
	}

	UNSAFE_componentWillMount() {
		this.reinitializeSearch();
	}

	componentDidMount() {
		if ( this.props.search && this.props.searchTitle ) {
			this.props.recordTracksEvent( 'calypso_plugins_search_noresults_recommendations_show', {
				search_query: this.props.search,
			} );
		}
	}

	getVisibleCategories() {
		if ( ! this.isRecommendedPluginsEnabled() ) {
			return VISIBLE_CATEGORIES;
		}
		return VISIBLE_CATEGORIES_FOR_RECOMMENDATIONS;
	}

	isRecommendedPluginsEnabled() {
		return (
			isEnabled( 'recommend-plugins' ) &&
			!! this.props.selectedSiteId &&
			get( this.props.selectedSite, 'jetpack' )
		);
	}

	fetchNextPagePlugins = () => {
		const { category, isFetchingPluginsByCategory } = this.props;
		if ( ! category ) {
			return;
		}

		// If a request for this category is in progress, don't issue a new one
		if ( isFetchingPluginsByCategory ) {
			return;
		}

		this.props.fetchPluginsCategoryNextPage( category );
	};

	getPluginBrowserContent() {
		if ( this.props.search ) {
			return this.getSearchListView();
		}
		if ( this.props.category ) {
			return this.getFullListView();
		}
		return this.getShortListsView();
	}

	translateCategory( category ) {
		const { translate } = this.props;

		const recommendedText = translate( 'Recommended', {
			context: 'Category description for the plugin browser.',
		} );

		switch ( category ) {
			case 'new':
				return translate( 'New', {
					context: 'Category description for the plugin browser.',
				} );
			case 'popular':
				return translate( 'Popular', {
					context: 'Category description for the plugin browser.',
				} );
			case 'featured':
				return translate( 'Featured', {
					context: 'Category description for the plugin browser.',
				} );
			case 'recommended':
				return recommendedText;
		}
	}

	getFullListView() {
		const { category, isFetchingPluginsByCategory, pluginsByCategory } = this.props;
		if ( pluginsByCategory.length > 0 || isFetchingPluginsByCategory ) {
			return (
				<PluginsBrowserList
					plugins={ pluginsByCategory }
					listName={ category }
					title={ this.translateCategory( category ) }
					site={ this.props.siteSlug }
					showPlaceholders={ isFetchingPluginsByCategory }
					currentSites={ this.props.sites }
				/>
			);
		}
	}

	getSearchListView() {
		const { search: searchTerm, isFetchingPluginsBySearchTerm, pluginsBySearchTerm } = this.props;
		if ( pluginsBySearchTerm.length > 0 || isFetchingPluginsBySearchTerm ) {
			const searchTitle =
				this.props.searchTitle ||
				this.props.translate( 'Results for: %(searchTerm)s', {
					textOnly: true,
					args: {
						searchTerm,
					},
				} );
			return (
				<PluginsBrowserList
					plugins={ pluginsBySearchTerm }
					listName={ searchTerm }
					title={ searchTitle }
					site={ this.props.siteSlug }
					showPlaceholders={ isFetchingPluginsBySearchTerm }
					currentSites={ this.props.sites }
				/>
			);
		}
		return (
			<NoResults
				text={ this.props.translate( 'No plugins match your search for {{searchTerm/}}.', {
					textOnly: true,
					components: { searchTerm: <em>{ searchTerm }</em> },
				} ) }
			/>
		);
	}

	getPluginSingleListView( category ) {
		let plugins;
		let isFetching;
		if ( category === 'new' ) {
			plugins = this.props.pluginsByCategoryNew;
			isFetching = this.props.isFetchingPluginsByCategoryNew;
		} else if ( category === 'popular' ) {
			plugins = this.props.pluginsByCategoryPopular;
			isFetching = this.props.isFetchingPluginsByCategoryPopular;
		} else if ( category === 'featured' ) {
			plugins = this.props.pluginsByCategoryFeatured;
			isFetching = this.props.isFetchingPluginsByCategoryFeatured;
		} else {
			return;
		}

		const listLink = '/plugins/' + category + '/';
		return (
			<PluginsBrowserList
				plugins={ plugins.slice( 0, SHORT_LIST_LENGTH ) }
				listName={ category }
				title={ this.translateCategory( category ) }
				site={ this.props.siteSlug }
				expandedListLink={ plugins.length > SHORT_LIST_LENGTH ? listLink : false }
				size={ SHORT_LIST_LENGTH }
				showPlaceholders={ isFetching }
				currentSites={ this.props.sites }
			/>
		);
	}

	getRecommendedPluginListView() {
		const { recommendedPlugins } = this.props;
		if ( recommendedPlugins && recommendedPlugins.length === 0 ) {
			return;
		}

		return (
			<PluginsBrowserList
				currentSites={ this.props.sites }
				expandedListLink={ false }
				listName="recommended"
				plugins={ recommendedPlugins }
				showPlaceholders={ this.props.isRequestingRecommendedPlugins }
				site={ this.props.siteSlug }
				size={ SHORT_LIST_LENGTH }
				title={ this.translateCategory( 'recommended' ) }
			/>
		);
	}

	getShortListsView() {
		return (
			<span>
				{ this.isRecommendedPluginsEnabled()
					? this.getRecommendedPluginListView()
					: this.getPluginSingleListView( 'featured' ) }

				{ this.getPluginSingleListView( 'popular' ) }
				{ this.getPluginSingleListView( 'new' ) }
			</span>
		);
	}

	recordSearchEvent = ( eventName ) => this.props.recordGoogleEvent( 'PluginsBrowser', eventName );

	getSearchBox() {
		const { WrappedSearch } = this;

		return (
			<WrappedSearch
				pinned
				fitsContainer
				onSearch={ this.props.doSearch }
				initialValue={ this.props.search }
				placeholder={ this.props.translate( 'Search Plugins' ) }
				delaySearch={ true }
				recordEvent={ this.recordSearchEvent }
			/>
		);
	}

	getNavigationBar() {
		const site = this.props.siteSlug ? '/' + this.props.siteSlug : '';
		return (
			<SectionNav
				selectedText={ this.props.translate( 'Category', {
					context: 'Category of plugins to be filtered by',
				} ) }
			>
				<NavTabs label="Category">
					<NavItem path={ '/plugins' + site } selected={ false }>
						{ this.props.translate( 'All', { context: 'Filter all plugins' } ) }
					</NavItem>
					<NavItem
						path={ '/plugins/featured' + site }
						selected={ this.props.path === '/plugins/featured' + site }
					>
						{ this.props.translate( 'Featured', { context: 'Filter featured plugins' } ) }
					</NavItem>
					<NavItem
						path={ '/plugins/popular' + site }
						selected={ this.props.path === '/plugins/popular' + site }
					>
						{ this.props.translate( 'Popular', { context: 'Filter popular plugins' } ) }
					</NavItem>
					<NavItem
						path={ '/plugins/new' + site }
						selected={ this.props.path === '/plugins/new' + site }
					>
						{ this.props.translate( 'New', { context: 'Filter new plugins' } ) }
					</NavItem>
				</NavTabs>
				{ this.getSearchBox() }
			</SectionNav>
		);
	}

	handleSuggestedSearch = ( term ) => () => {
		this.reinitializeSearch();
		this.props.doSearch( term );
	};

	getSearchBar() {
		const suggestedSearches = [
			this.props.translate( 'Engagement', { context: 'Plugins suggested search term' } ),
			this.props.translate( 'Security', { context: 'Plugins suggested search term' } ),
			this.props.translate( 'Appearance', { context: 'Plugins suggested search term' } ),
			this.props.translate( 'Writing', { context: 'Plugins suggested search term' } ),
		];

		return (
			<SectionNav
				selectedText={ this.props.translate( 'Suggested Searches', {
					context: 'Suggested searches for plugins',
				} ) }
			>
				<NavTabs label="Suggested Searches">
					{ suggestedSearches.map( ( term ) => (
						<NavItem key={ term } onClick={ this.handleSuggestedSearch( term ) }>
							{ term }
						</NavItem>
					) ) }
				</NavTabs>
				{ this.getSearchBox() }
			</SectionNav>
		);
	}

	shouldShowManageButton() {
		if ( this.props.isJetpackSite ) {
			return true;
		}
		return ! this.props.selectedSiteId && this.props.hasJetpackSites;
	}

	renderManageButton() {
		if ( ! this.shouldShowManageButton() ) {
			return null;
		}

		const { siteSlug, translate } = this.props;
		const site = siteSlug ? '/' + siteSlug : '';

		return (
			<Button className="plugins-browser__button" href={ '/plugins/manage' + site }>
				<span className="plugins-browser__button-text">{ translate( 'Manage plugins' ) }</span>
			</Button>
		);
	}

	handleUploadPluginButtonClick = () => {
		this.props.recordTracksEvent( 'calypso_click_plugin_upload' );
		this.props.recordGoogleEvent( 'Plugins', 'Clicked Plugin Upload Link' );
	};

	renderUploadPluginButton() {
		if ( ! isEnabled( 'manage/plugins/upload' ) ) {
			return null;
		}

		const { siteSlug, translate } = this.props;
		const uploadUrl = '/plugins/upload' + ( siteSlug ? '/' + siteSlug : '' );

		return (
			<Button
				className="plugins-browser__button"
				onClick={ this.handleUploadPluginButtonClick }
				href={ uploadUrl }
			>
				<span className="plugins-browser__button-text">{ translate( 'Install plugin' ) }</span>
			</Button>
		);
	}

	getPageHeaderView() {
		if ( this.props.hideSearchForm ) {
			return null;
		}

		const navigation = this.props.category ? this.getNavigationBar() : this.getSearchBar();

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="plugins-browser__main">
				<div className="plugins-browser__main-header">
					<div className="plugins__header-navigation">{ navigation }</div>
				</div>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	renderUpgradeNudge() {
		if (
			! this.props.selectedSiteId ||
			! this.props.sitePlan ||
			this.props.isVipSite ||
			this.props.jetpackNonAtomic ||
			this.props.hasBusinessPlan
		) {
			return null;
		}

		const { translate, siteSlug } = this.props;
		const bannerURL = `/checkout/${ siteSlug }/business`;
		const plan = findFirstSimilarPlanKey( this.props.sitePlan.product_slug, {
			type: TYPE_BUSINESS,
		} );
		const title = translate( 'Upgrade to the Business plan to install plugins.' );

		return (
			<UpsellNudge
				event="calypso_plugins_browser_upgrade_nudge"
				showIcon={ true }
				href={ bannerURL }
				feature={ FEATURE_UPLOAD_PLUGINS }
				plan={ plan }
				title={ title }
			/>
		);
	}

	renderPageViewTracker() {
		const { category, selectedSiteId, trackPageViews } = this.props;

		const analyticsPageTitle = 'Plugin Browser' + category ? ` > ${ category }` : '';
		let analyticsPath = category ? `/plugins/${ category }` : '/plugins';

		if ( selectedSiteId ) {
			analyticsPath += '/:site';
		}

		if ( trackPageViews ) {
			return <PageViewTracker path={ analyticsPath } title={ analyticsPageTitle } />;
		}

		return null;
	}

	render() {
		const { category, search } = this.props;
		if ( ! this.props.isRequestingSites && this.props.noPermissionsError ) {
			return <NoPermissionsError title={ this.props.translate( 'Plugins', { textOnly: true } ) } />;
		}

		return (
			<MainComponent wideLayout>
				{ category && <QueryWporgPlugins category={ category } /> }
				{ search && <QueryWporgPlugins searchTerm={ search } /> }
				{ ! category && ! search && (
					<Fragment>
						<QueryWporgPlugins category="new" />
						<QueryWporgPlugins category="popular" />
						<QueryWporgPlugins category="featured" />
					</Fragment>
				) }

				{ this.isRecommendedPluginsEnabled() && (
					<QuerySiteRecommendedPlugins siteId={ this.props.selectedSiteId } />
				) }
				{ this.renderPageViewTracker() }
				<DocumentHead title={ this.props.translate( 'Plugins', { textOnly: true } ) } />
				<SidebarNavigation />
				{ ! this.props.hideHeader && (
					<div className="plugins-browser__header">
						<FormattedHeader
							brandFont
							className="plugins-browser__page-heading"
							headerText={ this.props.translate( 'Plugins' ) }
							align="left"
							subHeaderText={ this.props.translate(
								'Add new functionality and integrations to your site with plugins.'
							) }
						/>
						<div className="plugins-browser__main-buttons">
							{ this.renderManageButton() }
							{ this.renderUploadPluginButton() }
						</div>
					</div>
				) }
				{ this.renderUpgradeNudge() }
				{ this.getPageHeaderView() }
				{ this.getPluginBrowserContent() }
				<InfiniteScroll nextPageMethod={ this.fetchNextPagePlugins } />
			</MainComponent>
		);
	}
}

export default flow(
	localize,
	urlSearch,
	connect(
		( state, { category, search } ) => {
			const selectedSiteId = getSelectedSiteId( state );
			const sitePlan = getSitePlan( state, selectedSiteId );

			const hasBusinessPlan =
				sitePlan &&
				( isBusiness( sitePlan ) || isEnterprise( sitePlan ) || isEcommerce( sitePlan ) );
			const hasPremiumPlan = sitePlan && ( hasBusinessPlan || isPremium( sitePlan ) );
			const recommendedPlugins = getRecommendedPlugins( state, selectedSiteId );

			return {
				selectedSiteId,
				sitePlan,
				hasPremiumPlan,
				hasBusinessPlan,
				isJetpackSite: isJetpackSite( state, selectedSiteId ),
				jetpackNonAtomic:
					isJetpackSite( state, selectedSiteId ) && ! isAtomicSite( state, selectedSiteId ),
				isVipSite: isVipSite( state, selectedSiteId ),
				hasJetpackSites: hasJetpackSites( state ),
				isRequestingSites: isRequestingSites( state ),
				noPermissionsError:
					!! selectedSiteId && ! canCurrentUser( state, selectedSiteId, 'manage_options' ),
				selectedSite: getSelectedSite( state ),
				siteSlug: getSelectedSiteSlug( state ),
				sites: getSelectedOrAllSitesJetpackCanManage( state ),
				isRequestingRecommendedPlugins: ! Array.isArray( recommendedPlugins ),
				recommendedPlugins: recommendedPlugins || [],
				pluginsByCategory: getPluginsListByCategory( state, category ),
				pluginsByCategoryNew: getPluginsListByCategory( state, 'new' ),
				pluginsByCategoryPopular: getPluginsListByCategory( state, 'popular' ),
				pluginsByCategoryFeatured: getPluginsListByCategory( state, 'featured' ),
				pluginsBySearchTerm: getPluginsListBySearchTerm( state, search ),
				isFetchingPluginsByCategory: isFetchingPluginsList( state, category ),
				isFetchingPluginsByCategoryNew: isFetchingPluginsList( state, 'new' ),
				isFetchingPluginsByCategoryPopular: isFetchingPluginsList( state, 'popular' ),
				isFetchingPluginsByCategoryFeatured: isFetchingPluginsList( state, 'featured' ),
				isFetchingPluginsBySearchTerm: isFetchingPluginsList( state, null, search ),
			};
		},
		{
			fetchPluginsCategoryNextPage,
			recordTracksEvent,
			recordGoogleEvent,
		}
	)
)( PluginsBrowser );
