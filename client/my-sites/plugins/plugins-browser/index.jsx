/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SidebarNavigation from 'my-sites/sidebar-navigation';
import DocumentHead from 'components/data/document-head';
import Search from 'components/search';
import SearchCard from 'components/search-card';
import SectionNav from 'components/section-nav';
import MainComponent from 'components/main';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import NoResults from 'my-sites/no-results';
import PluginsBrowserList from 'my-sites/plugins/plugins-browser-list';
import PluginsListStore from 'lib/plugins/wporg-data/list-store';
import PluginsActions from 'lib/plugins/wporg-data/actions';
import URLSearch from 'lib/mixins/url-search';
import infiniteScroll from 'lib/mixins/infinite-scroll';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import { hasTouch } from 'lib/touch-detect';
import { recordTracksEvent } from 'state/analytics/actions';
import { canCurrentUser } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	canJetpackSiteManage,
	isJetpackSite,
	isRequestingSites
} from 'state/sites/selectors';
import NonSupportedJetpackVersionNotice from 'my-sites/plugins/not-supported-jetpack-version';
import NoPermissionsError from 'my-sites/plugins/no-permissions-error';

const PluginsBrowser = React.createClass( {
	_SHORT_LIST_LENGTH: 6,

	visibleCategories: [ 'new', 'popular', 'featured' ],

	mixins: [ infiniteScroll( 'fetchNextPagePlugins' ), URLSearch ],

	componentDidMount() {
		PluginsListStore.on( 'change', this.refreshLists );
		this.props.sites.on( 'change', this.refreshLists );

		if ( this.props.search && this.props.searchTitle ) {
			this.props.recordTracksEvent( 'calypso_plugins_search_noresults_recommendations_show', {
				search_query: this.props.search
			} );
		}
	},

	getInitialState() {
		return this.getPluginsLists( this.props.search );
	},

	componentWillUnmount() {
		PluginsListStore.removeListener( 'change', this.refreshLists );
		this.props.sites.removeListener( 'change', this.refreshLists );
	},

	componentWillReceiveProps( newProps ) {
		this.refreshLists( newProps.search );
	},

	refreshLists( search ) {
		this.setState( this.getPluginsLists( search || this.props.search ) );
	},

	fetchNextPagePlugins() {
		let doSearch = true;

		if ( this.state.fullLists.search && this.state.fullLists.search.fetching ) {
			doSearch = false;
		}

		if ( this.state.fullLists.search && this.state.fullLists.search.list && this.state.fullLists.search.list.length < 10 ) {
			doSearch = false;
		}

		if ( this.props.search && doSearch ) {
			PluginsActions.fetchNextCategoryPage( 'search', this.props.search );
		} else if ( this.props.category ) {
			PluginsActions.fetchNextCategoryPage( this.props.category );
		}
	},

	getPluginsLists( search ) {
		const shortLists = {},
			fullLists = {};
		this.visibleCategories.forEach( category => {
			shortLists[ category ] = PluginsListStore.getShortList( category );
			fullLists[ category ] = PluginsListStore.getFullList( category );
		} );
		fullLists.search = PluginsListStore.getSearchList( search );
		return {
			shortLists: shortLists,
			fullLists: fullLists
		};
	},

	getPluginsShortList( listName ) {
		return this.state.shortLists[ listName ] ? this.state.shortLists[ listName ].list : [];
	},

	getPluginsFullList( listName ) {
		return this.state.fullLists[ listName ] ? this.state.fullLists[ listName ].list : [];
	},

	getPluginBrowserContent() {
		if ( this.props.search ) {
			return this.getSearchListView( this.props.search );
		}
		if ( this.props.category ) {
			return this.getFullListView( this.props.category );
		}
		return this.getShortListsView();
	},

	translateCategory( category ) {
		switch ( category ) {
			case 'new':
				return this.translate( 'New', { context: 'Category description for the plugin browser.' } );
			case 'popular':
				return this.translate( 'Popular', { context: 'Category description for the plugin browser.' } );
			case 'featured':
				return this.translate( 'Featured', { context: 'Category description for the plugin browser.' } );
		}
	},

	getFullListView( category ) {
		const isFetching = this.state.fullLists[ category ] ? !! this.state.fullLists[ category ].fetching : true;
		if ( this.getPluginsFullList( category ).length > 0 || isFetching ) {
			return <PluginsBrowserList
				plugins={ this.getPluginsFullList( category ) }
				listName={ category }
				title={ this.translateCategory( category ) }
				site={ this.props.site }
				showPlaceholders={ isFetching }
				currentSites={ this.props.sites.getSelectedOrAllJetpackCanManage() } />;
		}
	},

	getSearchListView( searchTerm ) {
		const isFetching = this.state.fullLists.search ? !! this.state.fullLists.search.fetching : true;
		if ( this.getPluginsFullList( 'search' ).length > 0 || isFetching ) {
			const searchTitle = this.props.searchTitle || this.translate( 'Results for: %(searchTerm)s', {
				textOnly: true,
				args: {
					searchTerm
				}
			} );
			return <PluginsBrowserList
				plugins={ this.getPluginsFullList( 'search' ) }
				listName={ searchTerm }
				title={ searchTitle }
				site={ this.props.site }
				showPlaceholders={ isFetching }
				currentSites={ this.props.sites.getSelectedOrAllJetpackCanManage() } />;
		}
		return (
			<NoResults
				text={
					this.translate( 'No plugins match your search for {{searchTerm/}}.', {
						textOnly: true,
						components: { searchTerm: <em>{ searchTerm }</em> }
					} )
				} />
		);
	},

	getPluginSingleListView( category ) {
		const listLink = '/plugins/browse/' + category + '/';
		return <PluginsBrowserList
			plugins={ this.getPluginsShortList( category ) }
			listName={ category }
			title={ this.translateCategory( category ) }
			site={ this.props.site }
			expandedListLink={ this.getPluginsFullList( category ).length > this._SHORT_LIST_LENGTH ? listLink : false }
			size={ this._SHORT_LIST_LENGTH }
			showPlaceholders={ this.state.fullLists[ category ].fetching !== false }
			currentSites={ this.props.sites.getSelectedOrAllJetpackCanManage() } />;
	},

	getShortListsView() {
		return (
			<span>
				{ this.getPluginSingleListView( 'featured' ) }
				{ this.getPluginSingleListView( 'popular' ) }
				{ this.getPluginSingleListView( 'new' ) }
			</span>
		);
	},

	getSearchBox( pinned ) {
		if ( pinned ) {
			return (
				<Search
					pinned
					fitsContainer
					onSearch={ this.doSearch }
					initialValue={ this.props.search }
					placeholder={ this.translate( 'Search Plugins' ) }
					delaySearch={ true }
					analyticsGroup="PluginsBrowser" />
			);
		}

		return (
			<SearchCard
				autoFocus={ ! hasTouch() }
				onSearch={ this.doSearch }
				initialValue={ this.props.search }
				placeholder={ this.translate( 'Search Plugins' ) }
				delaySearch={ true }
				analyticsGroup="PluginsBrowser" />
		);
	},

	getNavigationBar() {
		const site = this.props.site ? '/' + this.props.site : '';
		return <SectionNav selectedText={ this.translate( 'Category', { context: 'Category of plugins to be filtered by' } ) }>
			<NavTabs label="Category">
				<NavItem
					path={ '/plugins/browse' + site }
					selected={ false }
				>
					{ this.translate( 'All', { context: 'Filter all plugins' } ) }
				</NavItem>
				<NavItem
					path={ '/plugins/browse/featured' + site }
					selected={ this.props.path === ( '/plugins/browse/featured' + site ) }
				>
					{ this.translate( 'Featured', { context: 'Filter featured plugins' } ) }
				</NavItem>
				<NavItem
					path={ '/plugins/browse/popular' + site }
					selected={ this.props.path === ( '/plugins/browse/popular' + site ) }
				>
					{ this.translate( 'Popular', { context: 'Filter popular plugins' } ) }
				</NavItem>
				<NavItem
					path={ '/plugins/browse/new' + site }
					selected={ this.props.path === ( '/plugins/browse/new' + site ) }
				>
					{ this.translate( 'New', { context: 'Filter new plugins' } ) }
				</NavItem>
			</NavTabs>
			{ this.getSearchBox( true ) }
		</SectionNav>;
	},

	getPageHeaderView() {
		if ( this.props.category ) {
			return this.getNavigationBar();
		}

		if ( this.props.hideSearchForm ) {
			return;
		}

		return (
			<div className="plugins-browser__main-header">
				{ this.getSearchBox( false ) }
			</div>
		);
	},

	getMockPluginItems() {
		return <PluginsBrowserList
			plugins={ this.getPluginsShortList( 'popular' ) }
			listName={ 'Plugins' }
			title={ this.translate( 'Popular Plugins' ) }
			size={ 12 } />;
	},

	renderDocumentHead() {
		return <DocumentHead title={ this.translate( 'Plugin Browser', { textOnly: true } ) } />;
	},

	renderJetpackManageError() {
		const { selectedSiteId } = this.props;

		return (
			<MainComponent>
				{ this.renderDocumentHead() }
				<SidebarNavigation />
				<JetpackManageErrorPage
					template="optInManage"
					title={ this.translate( 'Looking to manage this site\'s plugins?' ) }
					siteId={ selectedSiteId }
					section="plugins"
					illustration="/calypso/images/jetpack/jetpack-manage.svg"
					featureExample={ this.getMockPluginItems() } />
			</MainComponent>
		);
	},

	render() {
		if ( ! this.props.isRequestingSites && this.props.noPermissionsError ) {
			return <NoPermissionsError title={ this.props.translate( 'Plugin Browser', { textOnly: true } ) } />;
		}

		if ( this.props.jetpackManageError ) {
			return this.renderJetpackManageError();
		}

		return (
			<MainComponent className="is-wide-layout">
				<NonSupportedJetpackVersionNotice />
				{ this.renderDocumentHead() }
				<SidebarNavigation />
				{ this.getPageHeaderView() }
				{ this.getPluginBrowserContent() }
			</MainComponent>
		);
	}
} );

export default connect(
	state => {
		const selectedSiteId = getSelectedSiteId( state );
		return {
			jetpackManageError: !! isJetpackSite( state, selectedSiteId ) && ! canJetpackSiteManage( state, selectedSiteId ),
			isRequestingSites: isRequestingSites( state ),
			noPermissionsError: !! selectedSiteId && ! canCurrentUser( state, selectedSiteId, 'manage_options' ),
			selectedSiteId,
		};
	},
	{
		recordTracksEvent
	}
)( localize( PluginsBrowser ) );
