/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { concat, find, flow, get, flatMap, includes } from 'lodash';
import PropTypes from 'prop-types';
import page from 'page';

/**
 * Internal dependencies
 */
import SidebarNavigation from 'my-sites/sidebar-navigation';
import DocumentHead from 'components/data/document-head';
import Search from 'components/search';
import SectionNav from 'components/section-nav';
import MainComponent from 'components/main';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import InfiniteScroll from 'components/infinite-scroll';
import NoResults from 'my-sites/no-results';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PluginsBrowserList from 'my-sites/plugins/plugins-browser-list';
import PluginsListStore from 'lib/plugins/wporg-data/list-store';
import PluginsStore from 'lib/plugins/store';
import PluginsActions from 'lib/plugins/wporg-data/actions';
import urlSearch from 'lib/url-search';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import { recordTracksEvent, recordGoogleEvent } from 'state/analytics/actions';
import canCurrentUser from 'state/selectors/can-current-user';
import getSelectedOrAllSitesJetpackCanManage from 'state/selectors/get-selected-or-all-sites-jetpack-can-manage';
import getRecommendedPlugins from 'state/selectors/get-recommended-plugins';
import isRequestingRecommendedPlugins from 'state/selectors/is-requesting-recommended-plugins';
import hasJetpackSites from 'state/selectors/has-jetpack-sites';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import {
	getSitePlan,
	isJetpackSite,
	isRequestingSites,
	canJetpackSiteManage,
} from 'state/sites/selectors';
import NonSupportedJetpackVersionNotice from 'my-sites/plugins/not-supported-jetpack-version';
import NoPermissionsError from 'my-sites/plugins/no-permissions-error';
import HeaderButton from 'components/header-button';
import { isBusiness, isEcommerce, isEnterprise, isPremium } from 'lib/products-values';
import { TYPE_BUSINESS, FEATURE_UPLOAD_PLUGINS } from 'lib/plans/constants';
import { findFirstSimilarPlanKey } from 'lib/plans';
import Banner from 'components/banner';
import { isEnabled } from 'config';
import wpcomFeaturesAsPlugins from './wpcom-features-as-plugins';
import { abtest } from 'lib/abtest';
import QuerySiteRecommendedPlugins from 'components/data/query-site-recommended-plugins'; // new query component

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Module variables
 */
const SHORT_LIST_LENGTH = 6;

export class PluginsBrowser extends Component {
	static displayName = 'PluginsBrowser';

	static propTypes = {
		isRequestingRecommendedPlugins: PropTypes.bool.isRequired,
		recommendedPlugins: PropTypes.arrayOf( PropTypes.object ),
		selectedSite: PropTypes.object,
		trackPageView: PropTypes.bool,
	};

	static defaultProps = {
		trackPageViews: true,
	};

	visibleCategories = [ 'new', 'popular' ];
	state = this.getPluginsLists( this.props.search );

	reinitializeSearch() {
		this.WrappedSearch = props => <Search { ...props } />;
	}

	UNSAFE_componentWillMount() {
		this.reinitializeSearch();
	}

	componentDidMount() {
		PluginsListStore.on( 'change', this.refreshLists );
		PluginsStore.on( 'change', this.refreshLists );

		if ( ! this.isRecommendedPluginsEnabled() ) {
			this.visibleCategories.push( 'featured' );
		}

		if ( this.props.search && this.props.searchTitle ) {
			this.props.recordTracksEvent( 'calypso_plugins_search_noresults_recommendations_show', {
				search_query: this.props.search,
			} );
		}
	}

	componentWillUnmount() {
		PluginsListStore.removeListener( 'change', this.refreshLists );
		PluginsStore.removeListener( 'change', this.refreshLists );
	}

	UNSAFE_componentWillReceiveProps( newProps ) {
		this.refreshLists( newProps.search );
	}

	isRecommendedPluginsEnabled() {
		return (
			!! this.props.selectedSiteId &&
			this.state.installedPlugins.length > 0 &&
			abtest( 'pluginRecommendations' ) === 'recommended'
		);
	}

	refreshLists = search => {
		this.setState( this.getPluginsLists( search || this.props.search ) );
	};

	fetchNextPagePlugins = () => {
		const category = this.props.search ? 'search' : this.props.category;

		if ( ! category ) {
			return;
		}

		const fullList = get( this.state.fullLists, category );

		// If a request for this category is in progress, don't issue a new one
		if ( get( fullList, 'fetching' ) ) {
			return;
		}

		// If the first search request returned just a few results that fill less than one full page,
		// don't try to fetch the next page. We already have all the results.
		if ( category === 'search' && get( fullList, 'list.length', Infinity ) < 24 ) {
			return;
		}

		PluginsActions.fetchNextCategoryPage( category, this.props.search );
	};

	getPluginsLists( search ) {
		const shortLists = {};
		const fullLists = {};

		this.visibleCategories.forEach( category => {
			shortLists[ category ] = PluginsListStore.getShortList( category );
			fullLists[ category ] = PluginsListStore.getFullList( category );
		} );
		fullLists.search = PluginsListStore.getSearchList( search );
		const output = { shortLists, fullLists, installedPlugins: [] };

		if ( this.props.selectedSite ) {
			// getPlugins can return undefined
			output.installedPlugins = PluginsStore.getPlugins( this.props.selectedSite ) || [];
		}

		return output;
	}

	getPluginsShortList( listName ) {
		return get( this.state.shortLists, [ listName, 'list' ], [] );
	}

	getPluginsFullList( listName ) {
		return get( this.state.fullLists, [ listName, 'list' ], [] );
	}

	getPluginBrowserContent() {
		if ( this.props.search ) {
			return this.getSearchListView( this.props.search );
		}
		if ( this.props.category ) {
			return this.getFullListView( this.props.category );
		}
		return this.getShortListsView();
	}

	translateCategory( category ) {
		const { translate } = this.props;

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
				return translate( 'Recommended', {
					context: 'Category description for the plugin browser.',
				} );
		}
	}

	getFullListView( category ) {
		const isFetching = get( this.state.fullLists, [ category, 'fetching' ], true );
		const list = this.getPluginsFullList( category );
		if ( list.length > 0 || isFetching ) {
			return (
				<PluginsBrowserList
					plugins={ list }
					listName={ category }
					title={ this.translateCategory( category ) }
					site={ this.props.siteSlug }
					showPlaceholders={ isFetching }
					currentSites={ this.props.sites }
				/>
			);
		}
	}

	getSearchListView( searchTerm ) {
		const isFetching = get( this.state.fullLists, 'search.fetching', true );
		const list = concat(
			this.getWpcomFeaturesAsJetpackPluginsList( searchTerm ),
			this.getPluginsFullList( 'search' )
		);
		if ( list.length > 0 || isFetching ) {
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
					plugins={ list }
					listName={ searchTerm }
					title={ searchTitle }
					site={ this.props.siteSlug }
					showPlaceholders={ isFetching }
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
		const listLink = '/plugins/' + category + '/';
		return (
			<PluginsBrowserList
				plugins={ this.getPluginsShortList( category ) }
				listName={ category }
				title={ this.translateCategory( category ) }
				site={ this.props.siteSlug }
				expandedListLink={
					this.getPluginsFullList( category ).length > SHORT_LIST_LENGTH ? listLink : false
				}
				size={ SHORT_LIST_LENGTH }
				showPlaceholders={ get( this.state.fullLists, [ category, 'fetching' ] ) !== false }
				currentSites={ this.props.sites }
			/>
		);
	}

	getRecommendedPluginListView() {
		return (
			<PluginsBrowserList
				currentSites={ this.props.sites }
				expandedListLink={ false }
				listName={ 'recommended' }
				plugins={ this.props.recommendedPlugins }
				showPlaceholders={ this.props.isRequestingRecommendedPlugins }
				site={ this.props.siteSlug }
				size={ SHORT_LIST_LENGTH }
				title={ this.translateCategory( 'recommended' ) }
			/>
		);
	}

	isWpcomPluginActive( plugin ) {
		return (
			'standard' === plugin.plan ||
			( 'premium' === plugin.plan && this.props.hasPremiumPlan ) ||
			( 'business' === plugin.plan && this.props.hasBusinessPlan )
		);
	}

	getWpcomFeaturesAsJetpackPluginsList( searchTerm ) {
		// show only for Simple sites
		if ( ! this.props.selectedSiteId || this.props.isJetpackSite ) {
			return [];
		}

		// show only if search is active
		if ( ! searchTerm ) {
			return [];
		}

		const { siteSlug, translate } = this.props;
		searchTerm = searchTerm.toLocaleLowerCase();
		let matchingPlugins;
		const plugins = wpcomFeaturesAsPlugins( translate );

		// Is the search term exactly equal to one of group category names (Engagement, Writing, ...)?
		// Then return the whole group as search results.
		// Otherwise, search plugin names and descriptions for the search term.
		const matchingGroup = find( plugins, group => group.category === searchTerm );
		if ( matchingGroup ) {
			matchingPlugins = matchingGroup.plugins;
		} else {
			// Flatten plugins from all groups into one long list and the filter it
			const allPlugins = flatMap( plugins, group => group.plugins );
			const includesSearchTerm = s => includes( s.toLocaleLowerCase(), searchTerm );
			matchingPlugins = allPlugins.filter(
				plugin => includesSearchTerm( plugin.name ) || includesSearchTerm( plugin.description )
			);
		}

		// Convert the list members into shapes expected by PluginsBrowserItem
		return matchingPlugins.map( plugin => ( {
			name: translate( '%(feature)s by Jetpack', {
				args: { feature: plugin.name },
				context: 'Presenting WordPress.com feature as a Jetpack pseudo-plugin',
			} ),
			author_name: 'Automattic',
			icon: '//ps.w.org/jetpack/assets/icon-256x256.png',
			rating: 82, // Jetpack rating on WP.org on 2017-09-27
			slug: 'jetpack',
			isPreinstalled: this.isWpcomPluginActive( plugin ),
			upgradeLink: '/plans/' + siteSlug + ( plugin.feature ? `?feature=${ plugin.feature }` : '' ),
		} ) );
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
				analyticsGroup="PluginsBrowser"
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

	handleSuggestedSearch = term => () => {
		this.reinitializeSearch();
		this.props.doSearch( term );
	};

	handleUpgradeNudgeClick = () => {
		const { siteSlug } = this.props;
		let href = `/plans/${ siteSlug }?feature=${ FEATURE_UPLOAD_PLUGINS }`;
		if (
			isEnabled( 'upsell/nudge-a-palooza' ) &&
			abtest( 'pluginsUpsellLandingPage' ) === 'test'
		) {
			href = '/feature/plugins/' + siteSlug;
		}
		page.redirect( href );
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
					{ suggestedSearches.map( term => (
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

		const site = this.props.siteSlug ? '/' + this.props.siteSlug : '';
		return (
			<HeaderButton
				icon="cog"
				label={ this.props.translate( 'Manage Plugins' ) }
				href={ '/plugins/manage' + site }
			/>
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
			<HeaderButton
				icon="cloud-upload"
				label={ translate( 'Upload Plugin' ) }
				aria-label={ translate( 'Upload Plugin' ) }
				href={ uploadUrl }
				onClick={ this.handleUploadPluginButtonClick }
			/>
		);
	}

	getPageHeaderView() {
		if ( this.props.hideSearchForm ) {
			return null;
		}

		const navigation = this.props.category ? this.getNavigationBar() : this.getSearchBar();

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="plugins-browser__main-header">
				{ navigation }
				<div className="plugins__header-buttons">
					{ this.renderManageButton() }
					{ this.renderUploadPluginButton() }
				</div>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	getMockPluginItems() {
		return (
			<PluginsBrowserList
				plugins={ this.getPluginsShortList( 'popular' ) }
				listName={ 'Plugins' }
				title={ this.props.translate( 'Popular Plugins' ) }
				size={ 12 }
			/>
		);
	}

	renderDocumentHead() {
		return <DocumentHead title={ this.props.translate( 'Plugin Browser', { textOnly: true } ) } />;
	}

	renderJetpackManageError() {
		const { selectedSiteId } = this.props;

		return (
			<MainComponent>
				{ this.renderDocumentHead() }
				<SidebarNavigation />
				<JetpackManageErrorPage
					template="optInManage"
					title={ this.props.translate( "Looking to manage this site's plugins?" ) }
					siteId={ selectedSiteId }
					section="plugins"
					illustration="/calypso/images/jetpack/jetpack-manage.svg"
					featureExample={ this.getMockPluginItems() }
				/>
			</MainComponent>
		);
	}

	renderUpgradeNudge() {
		if (
			! this.props.selectedSiteId ||
			! this.props.sitePlan ||
			this.props.isJetpackSite ||
			this.props.hasBusinessPlan
		) {
			return null;
		}

		const { translate } = this.props;
		const plan = findFirstSimilarPlanKey( this.props.sitePlan.product_slug, {
			type: TYPE_BUSINESS,
		} );
		const title = translate( 'Upgrade to the Business plan to install plugins.' );

		return (
			<Banner
				event="calypso_plugins_browser_upgrade_nudge"
				disableHref={ true }
				onClick={ this.handleUpgradeNudgeClick }
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
		if ( ! this.props.isRequestingSites && this.props.noPermissionsError ) {
			return (
				<NoPermissionsError
					title={ this.props.translate( 'Plugin Browser', { textOnly: true } ) }
				/>
			);
		}

		if ( this.props.jetpackManageError ) {
			return this.renderJetpackManageError();
		}

		return (
			<MainComponent wideLayout>
				{ this.isRecommendedPluginsEnabled() && (
					<QuerySiteRecommendedPlugins siteId={ this.props.selectedSiteId } />
				) }
				{ this.renderPageViewTracker() }
				<NonSupportedJetpackVersionNotice />
				{ this.renderDocumentHead() }
				<SidebarNavigation />
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
		state => {
			const selectedSiteId = getSelectedSiteId( state );
			const sitePlan = getSitePlan( state, selectedSiteId );

			const hasBusinessPlan =
				sitePlan &&
				( isBusiness( sitePlan ) || isEnterprise( sitePlan ) || isEcommerce( sitePlan ) );
			const hasPremiumPlan = sitePlan && ( hasBusinessPlan || isPremium( sitePlan ) );

			return {
				selectedSiteId,
				sitePlan,
				hasPremiumPlan,
				hasBusinessPlan,
				isJetpackSite: isJetpackSite( state, selectedSiteId ),
				hasJetpackSites: hasJetpackSites( state ),
				jetpackManageError:
					!! isJetpackSite( state, selectedSiteId ) &&
					! canJetpackSiteManage( state, selectedSiteId ),
				isRequestingSites: isRequestingSites( state ),
				noPermissionsError:
					!! selectedSiteId && ! canCurrentUser( state, selectedSiteId, 'manage_options' ),
				selectedSite: getSelectedSite( state ),
				siteSlug: getSelectedSiteSlug( state ),
				sites: getSelectedOrAllSitesJetpackCanManage( state ),
				isRequestingRecommendedPlugins: isRequestingRecommendedPlugins( state, selectedSiteId ),
				recommendedPlugins: getRecommendedPlugins( state, selectedSiteId ),
			};
		},
		{
			recordTracksEvent,
			recordGoogleEvent,
		}
	)
)( PluginsBrowser );
