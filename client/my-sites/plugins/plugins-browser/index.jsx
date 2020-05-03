/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { concat, find, flow, get, flatMap, includes } from 'lodash';
import PropTypes from 'prop-types';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
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
import PluginsActions from 'lib/plugins/wporg-data/actions';
import urlSearch from 'lib/url-search';
import { recordTracksEvent, recordGoogleEvent } from 'state/analytics/actions';
import canCurrentUser from 'state/selectors/can-current-user';
import getSelectedOrAllSitesJetpackCanManage from 'state/selectors/get-selected-or-all-sites-jetpack-can-manage';
import getRecommendedPlugins from 'state/selectors/get-recommended-plugins';
import hasJetpackSites from 'state/selectors/has-jetpack-sites';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getSitePlan, isJetpackSite, isRequestingSites } from 'state/sites/selectors';
import isVipSite from 'state/selectors/is-vip-site';
import NoPermissionsError from 'my-sites/plugins/no-permissions-error';
import { Button } from '@automattic/components';
import { isBusiness, isEcommerce, isEnterprise, isPremium } from 'lib/products-values';
import { FEATURE_UPLOAD_PLUGINS, TYPE_BUSINESS } from 'lib/plans/constants';
import { findFirstSimilarPlanKey } from 'lib/plans';
import UpsellNudge from 'blocks/upsell-nudge';
import { isEnabled } from 'config';
import wpcomFeaturesAsPlugins from './wpcom-features-as-plugins';
import QuerySiteRecommendedPlugins from 'components/data/query-site-recommended-plugins';

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

	state = this.getPluginsLists( this.props.search );

	reinitializeSearch() {
		this.WrappedSearch = ( props ) => <Search { ...props } />;
	}

	UNSAFE_componentWillMount() {
		this.reinitializeSearch();
	}

	componentDidMount() {
		PluginsListStore.on( 'change', this.refreshLists );

		if ( this.props.search && this.props.searchTitle ) {
			this.props.recordTracksEvent( 'calypso_plugins_search_noresults_recommendations_show', {
				search_query: this.props.search,
			} );
		}
	}

	componentWillUnmount() {
		PluginsListStore.removeListener( 'change', this.refreshLists );
	}

	UNSAFE_componentWillReceiveProps( newProps ) {
		this.refreshLists( newProps.search );
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

	refreshLists = ( search ) => {
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

		this.getVisibleCategories().forEach( ( category ) => {
			shortLists[ category ] = PluginsListStore.getShortList( category );
			fullLists[ category ] = PluginsListStore.getFullList( category );
		} );

		fullLists.search = PluginsListStore.getSearchList( search );
		return { shortLists, fullLists };
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
				listName="recommended"
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
		const matchingGroup = find( plugins, ( group ) => group.category === searchTerm );
		if ( matchingGroup ) {
			matchingPlugins = matchingGroup.plugins;
		} else {
			// Flatten plugins from all groups into one long list and the filter it
			const allPlugins = flatMap( plugins, ( group ) => group.plugins );
			const includesSearchTerm = ( s ) => includes( s.toLocaleLowerCase(), searchTerm );
			matchingPlugins = allPlugins.filter(
				( plugin ) => includesSearchTerm( plugin.name ) || includesSearchTerm( plugin.description )
			);
		}

		// Convert the list members into shapes expected by PluginsBrowserItem
		return matchingPlugins.map( ( plugin ) => ( {
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
			<Button className="plugins-browser__button" compact href={ '/plugins/manage' + site }>
				<Gridicon icon="cog" />
				<span className="plugins-browser__button-text">{ translate( 'Manage Plugins' ) }</span>
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
				compact
				onClick={ this.handleUploadPluginButtonClick }
				href={ uploadUrl }
			>
				<Gridicon icon="cloud-upload" />
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
				<div className="plugins-browser__main-buttons">
					{ this.renderManageButton() }
					{ this.renderUploadPluginButton() }
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
			this.props.isJetpackSite ||
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
		if ( ! this.props.isRequestingSites && this.props.noPermissionsError ) {
			return (
				<NoPermissionsError
					title={ this.props.translate( 'Plugin Browser', { textOnly: true } ) }
				/>
			);
		}

		return (
			<MainComponent wideLayout>
				{ this.isRecommendedPluginsEnabled() && (
					<QuerySiteRecommendedPlugins siteId={ this.props.selectedSiteId } />
				) }
				{ this.renderPageViewTracker() }
				<DocumentHead title={ this.props.translate( 'Plugin Browser', { textOnly: true } ) } />
				<SidebarNavigation />
				<FormattedHeader
					className="plugins-browser__page-heading"
					headerText={ this.props.translate( 'Plugin Browser' ) }
					align="left"
				/>
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
		( state ) => {
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
			};
		},
		{
			recordTracksEvent,
			recordGoogleEvent,
		}
	)
)( PluginsBrowser );
