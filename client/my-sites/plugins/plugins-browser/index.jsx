/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var pluginsAccessControl = require( 'my-sites/plugins/access-control' ),
	EmptyContent = require( 'components/empty-content' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	Search = require( 'components/search' ),
	SearchCard = require( 'components/search-card' ),
	SectionNav = require( 'components/section-nav' ),
	MainComponent = require( 'components/main' ),
	NavTabs = require( 'components/section-nav/tabs' ),
	NavItem = require( 'components/section-nav/item' ),
	PluginsList = require( 'my-sites/plugins/plugins-browser-list' ),
	PluginsListStore = require( 'lib/plugins/wporg-data/list-store' ),
	PluginsActions = require( 'lib/plugins/wporg-data/actions' ),
	EmptyContent = require( 'components/empty-content' ),
	URLSearch = require( 'lib/mixins/url-search' ),
	infiniteScroll = require( 'lib/mixins/infinite-scroll' );

module.exports = React.createClass( {

	displayName: 'PluginsBrowser',
	_SHORT_LIST_LENGTH: 6,

	visibleCategories: [ 'new', 'popular', 'featured' ],

	mixins: [ infiniteScroll( 'fetchNextPagePlugins' ), URLSearch ],

	componentDidMount: function() {
		PluginsListStore.on( 'change', this.refreshLists );
		this.props.sites.on( 'change', this.refreshLists );
	},

	getInitialState: function() {
		return this.getPluginsLists( this.props.search );
	},

	componentWillUnmount: function() {
		PluginsListStore.removeListener( 'change', this.refreshLists );
		this.props.sites.removeListener( 'change', this.refreshLists );
	},

	componentWillReceiveProps: function( newProps ) {
		this.refreshLists( newProps.search );
	},

	refreshLists: function( search ) {
		this.setState( this.getPluginsLists( search || this.props.search ) );
	},

	fetchNextPagePlugins: function() {
		var doSearch = true;

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

	getPluginsLists: function( search ) {
		var shortLists = {},
			fullLists = {};
		this.visibleCategories.forEach( function( category ) {
			shortLists[ category ] = PluginsListStore.getShortList( category );
			fullLists[ category ] = PluginsListStore.getFullList( category );
		} );
		fullLists.search = PluginsListStore.getSearchList( search );
		return {
			accessError: pluginsAccessControl.hasRestrictedAccess(),
			shortLists: shortLists,
			fullLists: fullLists
		};
	},

	getPluginsShortList: function( listName ) {
		return this.state.shortLists[ listName ] ? this.state.shortLists[ listName ].list : [];
	},

	getPluginsFullList: function( listName ) {
		return this.state.fullLists[ listName ] ? this.state.fullLists[ listName ].list : [];
	},

	getPluginBrowserContent: function() {
		if ( this.props.search ) {
			return this.getSearchListView( this.props.search );
		}
		if ( this.props.category ) {
			return this.getFullListView( this.props.category );
		}
		return this.getShortListsView();
	},

	translateCategory: function( category ) {
		switch ( category ) {
			case 'new':
				return this.translate( 'new', { context: 'Category description for the plugin browser.' } );
			case 'popular':
				return this.translate( 'popular', { context: 'Category description for the plugin browser.' } );
			case 'featured':
				return this.translate( 'featured', { context: 'Category description for the plugin browser.' } );
		}
	},

	getFullListView: function( category ) {
		var isFetching = this.state.fullLists[ category ] ? !! this.state.fullLists[ category ].fetching : true;
		if ( this.getPluginsFullList( category ).length > 0 || isFetching ) {
			return <PluginsList plugins={ this.getPluginsFullList( category ) } listName={ category } title={ this.translateCategory( category ) } site={ this.props.site } showPlaceholders={ isFetching } currentSites={ this.props.sites.getSelectedOrAllJetpackCanManage() } />;
		}
	},

	getSearchListView: function( searchTerm ) {
		var isFetching = this.state.fullLists.search ? !! this.state.fullLists.search.fetching : true;
		if ( this.getPluginsFullList( 'search' ).length > 0 || isFetching ) {
			return <PluginsList plugins={ this.getPluginsFullList( 'search' ) } listName={ searchTerm } title={ searchTerm } site={ this.props.site } showPlaceholders={ isFetching } currentSites={ this.props.sites.getSelectedOrAllJetpackCanManage() } />;
		}
		return <EmptyContent
			title={ this.translate( 'Nothing to see here!' ) }
			line={ this.translate( 'We could\'t find any plugin with that text' ) }
			illustration={ '/calypso/images/drake/drake-404.svg' } />;
	},

	getPluginSingleListView: function( category ) {
		return <PluginsList
			plugins={ this.getPluginsShortList( category ) }
			listName={ category }
			title={ this.translateCategory( category ) }
			site={ this.props.site }
			expandedListLink={ this.getPluginsFullList( category ).length > this._SHORT_LIST_LENGTH ? '/plugins/browse/' + category + '/' : false }
			size={ this._SHORT_LIST_LENGTH }
			showPlaceholders={ this.state.fullLists[ category].fetching !== false }
			currentSites={ this.props.sites.getSelectedOrAllJetpackCanManage() } />;
	},

	getShortListsView: function() {
		return (
			<span>
				{ this.getPluginSingleListView( 'featured' ) }
				{ this.getPluginSingleListView( 'popular' ) }
				{ this.getPluginSingleListView( 'new' ) }
			</span>
		);
	},

	getSearchBox: function( pinned ) {
		if ( pinned ) {
			return (
				<Search
					onSearch={ this.doSearch }
					pinned={ pinned }
					initialValue={ this.props.search }
					placeholder={ this.translate( 'Search Plugins' ) }
					delaySearch={ true }
					analyticsGroup="PluginsBrowser"
				/>
			);
		}

		return (
			<SearchCard
				onSearch={ this.doSearch }
				initialValue={ this.props.search }
				placeholder={ this.translate( 'Search Plugins' ) }
				delaySearch={ true }
				analyticsGroup="PluginsBrowser"
			/>
		);
	},

	getNavigationBar: function() {
		var site = this.props.site ? '/' + this.props.site : '';
		return <SectionNav selectedText={ this.translate( 'Category', { context: 'Category of plugins to be filtered by' } ) }>
			<NavTabs label="Category" >
				<NavItem path={ '/plugins/browse' + site } selected={ false }>{ this.translate( 'All', { context: 'Filter all plugins' } ) } </NavItem>
				<NavItem path={ '/plugins/browse/featured' + site } selected={ this.props.path === ( '/plugins/browse/featured' + site ) } > { this.translate( 'Featured', { context: 'Filter featured plugins' } ) } </NavItem>
				<NavItem path={ '/plugins/browse/popular' + site } selected={ this.props.path === ( '/plugins/browse/popular' + site ) } > { this.translate( 'Popular', { context: 'Filter popular plugins' } ) } </NavItem>
				<NavItem path={ '/plugins/browse/new' + site } selected={ this.props.path === ( '/plugins/browse/new' + site ) } > { this.translate( 'New', { context: 'Filter new plugins' } ) } </NavItem>
			</NavTabs>
			{ this.getSearchBox( true ) }
		</SectionNav>;
	},

	getPageHeaderView: function() {
		if ( this.props.category ) {
			return this.getNavigationBar();
		}
		return (
			<div className="plugins-browser__main-header">
				{ this.getSearchBox( false ) }
			</div>
		);
	},

	render: function() {
		if ( this.state.accessError ) {
			return <MainComponent><EmptyContent { ...this.state.accessError } /></MainComponent>;
		}

		return (
			<MainComponent>
				<SidebarNavigation />
				{ this.getPageHeaderView() }
				{ this.getPluginBrowserContent() }
			</MainComponent>
		);
	}
} );
