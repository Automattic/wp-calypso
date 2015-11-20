/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:manage' );

/**
 * Internal dependencies
 */
var SiteCard = require( './site-card' ),
	SearchCard = require( 'components/search-card' ),
	Gridicon = require( 'components/gridicon' ),
	infiniteScroll = require( 'lib/mixins/infinite-scroll' ),
	observe = require( 'lib/mixins/data-observe' ),
	config = require( 'config' );

module.exports = React.createClass( {
	displayName: 'Sites',

	mixins: [ infiniteScroll( 'fetchNextPage' ), observe( 'sites', 'user' ) ],

	propTypes: {
		path: React.PropTypes.string.isRequired,
		trackScrollPage: React.PropTypes.func.isRequired
	},

	componentDidMount: function() {
		debug( 'Sites React component mounted.' );
	},

	getDefaultProps: function() {
		return {
			perPage: 12
		};
	},

	getInitialState: function() {
		return {
			page: 1,
			search: false
		};
	},

	componentWillReceiveProps: function( newProps ) {
		// reset paging when receiving new list
		if ( newProps.path !== this.props.path ) {
			this.setState( { page: 1 } );
		}
	},

	doSearch: function( keywords ) {
		this.setState( { search: keywords, page: 1 } );
	},

	getFilterTitle: function( filters ) {
		var filter = filters.filter( function( item ) {
			return this.props.path === item.path;
		}, this ).pop();

		if ( filter ) {
			return filter.title;
		}

		return filters[0].title;
	},

	getFilters: function() {
		return [
			{ title: this.translate( 'All Sites', { context: 'Filter Label' } ), path: '/sites', id: 'sites-index' },
			{ title: this.translate( 'Public', { context: 'Filter label for site list' } ), path: '/sites/public', id: 'sites-public' },
			{ title: this.translate( 'Private', { context: 'Filter label for site list' } ), path: '/sites/private', id: 'sites-private' }
		];

	},

	checkPathIsAFilter: function( filters ) {
		return filters.some( function( filter ) {
			return filter.path === this.props.path;
		}, this );
	},

	newSiteBox: function() {
		return (
			<div className="site-card site-card__add-new" key="new-site-box">
				<a href={ config( 'signup_url' ) + '?ref=calypso-sites' }>
					<div className="site-card__content">
						<Gridicon icon="add-outline" size={ 48 } />
						<h3 className="site-card__title">{ this.translate( 'Start a New WordPress' ) }</h3>
					</div>
				</a>
			</div>
		);
	},

	noSitesRender: function() {
		// No search results
		if ( this.state.search ) {
			return ( <span className="no-results">{ this.translate( 'Sorry, no sites found.' ) }</span> );
		// No sites-list data
		} else {
			if ( this.props.sites.initialized ) {
				return this.newSiteBox();
			} else {
				return this.placeholders();
			}
		}
	},

	getSiteCount: function() {
		var user, sites;
		if ( ! this.props.sites.initialized ) {
			user = this.props.user.get();
			return user.visible_site_count;
		}

		sites = this.props.sites.getVisible();
		return sites.length;
	},

	fetchNextPage: function( options ) {
		if ( this.state.page * this.props.perPage < this.sitesList().length ) {
			// order is important - setState may or may not alter this.state immediately
			if ( options.triggeredByScroll ) {
				this.props.trackScrollPage( this.state.page + 1 );
			}
			this.setState( { page: this.state.page + 1 } );
		}
	},

	sitesList: function() {
		var sites,
			path = this.props.path,
			is_private;

		// Override the path to be /sites so that when a site is
		// selected the filterbar is operates as if we're on /sites
		if ( this.props.sites.selected ) {
			path = '/sites';
		}

		if ( this.state.search ) {
			sites = this.props.sites.search( this.state.search );
		} else {
			sites = this.props.sites.getVisible();
		}

		/**
		 * Filters sites based on public or private nature
		 * for paths `/public` and `/private` only
		 */
		if ( path !== '/sites' && this.checkPathIsAFilter( this.getFilters() ) ) {
			is_private = path === '/sites/private';
			sites = sites.filter( function( site ) {
				return site.is_private === is_private;
			} );
		}

		// filter out jetpack sites when on particular routes
		if ( /^\/menus/.test( path ) || /^\/customize/.test( path ) ) {
			sites = sites.filter( function( site ) {
				return ! site.jetpack;
			} );
		}

		// filter out sites with no upgrades on particular routes
		if ( /^\/domains/.test( path ) || /^\/plans/.test( this.props.sourcePath ) ) {
			sites = sites.filter( function( site ) {
				return site.isUpgradeable();
			} );
		}

		return sites;
	},

	render: function() {
		var sites = this.sitesList(),
			sitesMarkup,
			siteSelectionHeaderText = this.translate( 'Please Select a Site:' ),
			sitesTruncated;

		if ( this.props.getSiteSelectionHeaderText ) {
			siteSelectionHeaderText = this.props.getSiteSelectionHeaderText();
		}

		sitesTruncated = sites.slice( 0, this.state.page * this.props.perPage );

		sitesMarkup = sitesTruncated.map( function( site ) {
			return (
				<SiteCard site={ site } key={ site.ID } sourcePath={ this.props.sourcePath }/>
			);
		}, this );

		if ( sites.length === sitesTruncated.length ) {
			sitesMarkup.push( this.newSiteBox() );
		}

		return (
			<div className="main main-column sites is-full" role="main">
				<h2 className="sites__select-heading">{ siteSelectionHeaderText }</h2>
				{ this.getSiteCount() > 1 ?
					<SearchCard onSearch={ this.doSearch } analyticsGroup="Sites" />
					: null
				}
				<div id="my-sites" className="sites-grid">
					{ sites.length !== 0 ? sitesMarkup : this.noSitesRender() }
				</div>
			</div>
		);
	},

	placeholders: function() {
		var items = [],
			i, limit;

		/**
		 * We only need to render a single page of items at maximum
		 */
		limit = Math.min( this.props.user.get().visible_site_count, this.props.perPage );

		/**
		 * Display empty boxes as placeholder for the user sites
		 * while those are still being loaded
		 */
		for ( i = 0; i < limit; i++ ) {
			items.push(
				<div className="site-card" key={ i }>
					<div className="site-card__content is-empty">
						<div className="site-card__header"><img /></div>
						<a><div className="site-icon"><img /></div><h3 className="site-title" /></a>
						<p className="site-card__description"></p>
					</div>
				</div>
			);
		}
		return items;
	}
} );
