/**
 * External dependencies
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import pluginsAccessControl from 'my-sites/plugins/access-control';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import Search from 'components/search';
import SearchCard from 'components/search-card';
import SectionNav from 'components/section-nav';
import MainComponent from 'components/main';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import NoResults from 'my-sites/no-results';
import PluginsBrowserList from 'my-sites/plugins/plugins-browser-list';
import EmptyContent from 'components/empty-content';
import URLSearch from 'lib/mixins/url-search';
import infiniteScroll from 'lib/mixins/infinite-scroll';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import FeatureExample from 'components/feature-example';
import { hasTouch } from 'lib/touch-detect';
import { recordTracksEvent } from 'state/analytics/actions';
import { fetchPluginsList } from 'state/plugins/wporg/actions';
import { canFetchList, getList, getShortList, isFetchingList, getCurrentSearchTerm } from 'state/plugins/wporg/selectors';
import QueryPluginLists from 'components/data/query-plugin-lists';

const SHORT_LIST_LENGTH = 6;
const FIST_PAGE = 1;

const PluginsBrowser = React.createClass( {

	displayName: 'PluginsBrowser',

	visibleCategories: [ 'new', 'popular', 'featured' ],

	mixins: [ infiniteScroll( 'fetchNextPagePlugins' ), URLSearch ],

	componentDidMount() {
		if ( this.props.search && this.props.searchTitle ) {
			this.props.recordTracksEvent( 'calypso_plugins_search_noresults_recommendations_show', {
				search_query: this.props.search
			} );
		}
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.search ) {
			if ( nextProps.search !== this.props.search ) {
				this.fetchNextPagePlugins( nextProps.search );
			}
		}
		this.setState( {
			accessError: pluginsAccessControl.hasRestrictedAccess()
		} );
	},

	fetchNextPagePlugins( searchTerm ) {
		searchTerm = typeof searchTerm === 'string' ? searchTerm : this.props.search;
		if ( searchTerm ) {
			const lastFetchedPage = this.props.lastPage.search >= FIST_PAGE ? this.props.lastPage.search : -1;
			if ( this.props.currentSearchTerm !== searchTerm ) {
				this.props.fetchPluginsList( 'search', FIST_PAGE, searchTerm );
			} else if ( this.props.canFetchList( 'search', lastFetchedPage + 1, searchTerm ) ) {
				this.props.fetchPluginsList( 'search', lastFetchedPage + 1, searchTerm );
			}
		} else if ( this.props.category ) {
			const lastFetchedPage = this.props.lastPage[ this.props.category ] >= FIST_PAGE
				? this.props.lastPage[ this.props.category ]
				: -1;
			if ( this.props.canFetchList( this.props.category, lastFetchedPage + 1 ) ) {
				this.props.fetchPluginsList( this.props.category, lastFetchedPage + 1 );
			}
		}
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
		const list = this.props.getList( category );
		if ( ( list && list.length > 0 ) || this.props.isFetchingList( category ) ) {
			return <PluginsBrowserList
				plugins={ list }
				listName={ category }
				title={ this.translateCategory( category ) }
				site={ this.props.site }
				showPlaceholders={ this.props.isFetchingList( category ) }
				currentSites={ this.props.sites.getSelectedOrAllJetpackCanManage() } />;
		}
	},

	getSearchListView( searchTerm ) {
		const isFetching = this.props.isFetchingList( 'search' );
		if ( this.props.getList( 'search' ).length > 0 || isFetching ) {
			const searchTitle = this.props.searchTitle || this.translate( 'Results for: %(searchTerm)s', {
				textOnly: true,
				args: {
					searchTerm
				}
			} );
			return <PluginsBrowserList
				plugins={ this.props.getList( 'search' ) }
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
			plugins={ this.props.getShortList( category ) }
			listName={ category }
			title={ this.translateCategory( category ) }
			site={ this.props.site }
			expandedListLink={ this.props.getList( category ).length > SHORT_LIST_LENGTH ? listLink : false }
			size={ SHORT_LIST_LENGTH }
			showPlaceholders={ this.props.isFetchingList( category ) !== false }
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

	getMockPluginItems: function() {
		return <PluginsBrowserList
			plugins={ this.props.getShortList( 'popular' ) }
			listName={ 'Plugins' }
			title={ this.translate( 'Popular Plugins' ) }
			size={ 12 } />;
	},

	renderAccessError() {
		if ( this.state.accessError ) {
			return (
				<MainComponent>
					<SidebarNavigation />
					<EmptyContent { ...this.state.accessError } />
					{ this.state.accessError.featureExample
						? <FeatureExample>{ this.state.accessError.featureExample }</FeatureExample>
						: null
					}
				</MainComponent>
			);
		}
		const selectedSite = this.props.sites.getSelectedSite();

		return (
			<MainComponent>
				<SidebarNavigation />
				<JetpackManageErrorPage
					template="optInManage"
					title={ this.translate( 'Looking to manage this site\'s plugins?' ) }
					site={ selectedSite }
					section="plugins"
					illustration="/calypso/images/jetpack/jetpack-manage.svg"
					featureExample={ this.getMockPluginItems() } />
			</MainComponent>
		);
	},

	render() {
		const selectedSite = this.props.sites.getSelectedSite();
		if ( this.state.accessError ||
				( selectedSite && selectedSite.jetpack && ! selectedSite.canManage() )
			) {
			return this.renderAccessError( selectedSite );
		}

		return (
			<MainComponent>
				<QueryPluginLists categories={ this.visibleCategories } />
				<SidebarNavigation />
				{ this.getPageHeaderView() }
				{ this.getPluginBrowserContent() }
			</MainComponent>
		);
	}
} );

export default connect(
	( state ) => {
		return {
			lastPage: state.plugins.wporg.lists.lastFetchedPage,
			canFetchList: ( category, searchTerm ) => canFetchList( state, category, searchTerm ),
			getList: ( category ) => getList( state, category ),
			getShortList: ( category ) => getShortList( state, category ),
			isFetchingList: ( category ) => isFetchingList( state, category ),
			currentSearchTerm: getCurrentSearchTerm( state )
		};
	},
	dispatch => bindActionCreators( {
		recordTracksEvent,
		fetchPluginsList
	}, dispatch )
)( PluginsBrowser );
