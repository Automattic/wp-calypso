/**
 * External dependencies
 */
var React = require( 'react' ),
	ReactDom = require( 'react-dom' ),
	page = require( 'page' ),
	noop = require( 'lodash/utility/noop' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var AllSites = require( 'my-sites/all-sites' ),
	Button = require( 'components/button' ),
	Gridicon = require( 'components/gridicon' ),
	Site = require( 'my-sites/site' ),
	SitePlaceholder = require( 'my-sites/site/placeholder' ),
	Search = require( 'components/search' ),
	user = require( 'lib/user' )(),
	config = require( 'config' );

module.exports = React.createClass( {
	displayName: 'SiteSelector',

	propTypes: {
		sites: React.PropTypes.object,
		showAddNewSite: React.PropTypes.bool,
		showAllSites: React.PropTypes.bool,
		indicator: React.PropTypes.bool,
		autoFocus: React.PropTypes.bool,
		onClose: React.PropTypes.func,
		selected: React.PropTypes.string,
		hideSelected: React.PropTypes.bool,
		filter: React.PropTypes.func,
		groups: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			sites: {},
			showAddNewSite: false,
			showAllSites: false,
			siteBasePath: false,
			indicator: false,
			hideSelected: false,
			selected: null,
			onClose: noop,
			onSiteSelect: noop,
			groups: false
		};
	},

	getInitialState: function() {
		return {
			search: ''
		};
	},

	onSearch: function( terms ) {
		this.setState( { search: terms } );
	},

	onSiteSelect: function( siteSlug, event ) {
		this.closeSelector();
		this.props.onSiteSelect( siteSlug );
		this.props.onClose( event );
		ReactDom.findDOMNode( this.refs.selector ).scrollTop = 0;

		// ignore mouse events as the default page() click event will handle navigation
		if ( this.props.siteBasePath && event.type !== 'mouseup' ) {
			page( event.currentTarget.pathname );
		}
	},

	closeSelector: function() {
		this.refs.siteSearch.blur();
	},

	addNewSite: function() {
		return (
			<span className="site-selector__add-new-site">
				<Button compact borderless href={ config( 'signup_url' ) + '?ref=calypso-selector' }>
					<Gridicon icon="add-outline" /> { this.translate( 'Add New WordPress' ) }
				</Button>
			</span>
		);
	},

	getSiteBasePath: function( site ) {
		var siteBasePath = this.props.siteBasePath,
			postsBase = ( site.jetpack || site.single_user_site ) ? '/posts' : '/posts/my';

		// Default posts to /posts/my when possible and /posts when not
		siteBasePath = siteBasePath.replace( /^\/posts\b(\/my)?/, postsBase );

		// Default stats to /stats/slug when on a 3rd level post/page summary
		if ( siteBasePath.match( /^\/stats\/(post|page)\// ) ) {
			siteBasePath = '/stats';
		}

		if ( siteBasePath.match( /^\/domains\/manage\// ) ) {
			siteBasePath = '/domains/manage';
		}

		return siteBasePath;
	},

	isSelected: function( site ) {
		var selectedSite = this.props.selected || this.props.sites.selected;
		return selectedSite === site.domain || selectedSite === site.slug;
	},

	shouldShowGroups: function() {
		if ( ! config.isEnabled( 'show-site-groups' ) ) {
			return false;
		}

		return this.props.groups && user.get().visible_site_count > 14;
	},

	renderSiteElements: function() {
		var allSitesPath = this.props.allSitesPath,
			sites, siteElements;

		if ( this.state.search ) {
			sites = this.props.sites.search( this.state.search );
		} else {
			sites = this.shouldShowGroups() ? this.props.sites.getVisibleAndNotRecent() : this.props.sites.getVisible();
		}

		if ( this.props.filter ) {
			sites = sites.filter( this.props.filter );
		}

		// Render sites
		siteElements = sites.map( function( site ) {
			var siteHref;

			if ( this.props.siteBasePath ) {
				siteHref = this.getSiteBasePath( site ) + '/' + site.slug;
			}

			const isSelected = this.isSelected( site );

			if ( isSelected && this.props.hideSelected ) {
				return;
			}

			return (
				<Site
					site={ site }
					href={ this.props.siteBasePath ? siteHref : null }
					key={ 'site-' + site.ID }
					indicator={ this.props.indicator }
					onSelect={ this.onSiteSelect.bind( this, site.slug ) }
					isSelected={ isSelected }
				/>
			);
		}, this );

		if ( this.props.showAllSites && ! this.state.search && allSitesPath ) {
			// default posts links to /posts/my when possible and /posts when not
			const postsBase = ( this.props.sites.allSingleSites ) ? '/posts' : '/posts/my';
			allSitesPath = allSitesPath.replace( /^\/posts\b(\/my)?/, postsBase );

			// There is currently no "all sites" version of the insights page
			allSitesPath = allSitesPath.replace( /^\/stats\/insights\/?$/, '/stats/day' );

			siteElements.unshift(
				<AllSites
					key="selector-all-sites"
					sites={ this.props.sites }
					href={ allSitesPath }
					onSelect={ this.onSiteSelect.bind( this, null ) }
					isSelected={ ! this.props.sites.selected }
				/>
			);
		}

		if ( ! siteElements.length ) {
			return <div className="site-selector__no-results">{ this.translate( 'No sites found' ) }</div>;
		}

		if ( this.shouldShowGroups() && ! this.state.search ) {
			return (
				<div>
					<span className="site-selector__heading">{ this.translate( 'Sites' ) }</span>
					{ siteElements }
				</div>
			);
		} else {
			return siteElements;
		}
	},

	renderRecentSites: function() {
		const sites = this.props.sites.getRecentlySelected();

		if ( ! sites || this.state.search || ! this.shouldShowGroups() ) {
			return null;
		}

		const recentSites = sites.map( function( site ) {
			var siteHref;

			if ( this.props.siteBasePath ) {
				siteHref = this.getSiteBasePath( site ) + '/' + site.slug;
			}

			const isSelected = this.isSelected( site );

			if ( isSelected && this.props.hideSelected ) {
				return;
			}

			return (
				<Site
					site={ site }
					href={ siteHref }
					key={ 'site-' + site.ID }
					indicator={ this.props.indicator }
					onSelect={ this.onSiteSelect.bind( this, site.slug ) }
					isSelected={ isSelected }
				/>
			);
		}, this );

		return (
			<div>
				<span className="site-selector__heading">{ this.translate( 'Recent Sites' ) }</span>
				{ recentSites }
			</div>
		);
	},

	render: function() {
		var isLarge = user.get().site_count > 6,
			hasOneSite = user.get().visible_site_count === 1,
			sitesInitialized = this.props.sites.initialized,
			siteElements, selectorClass;

		if ( sitesInitialized ) {
			siteElements = this.renderSiteElements();
		} else {
			siteElements = [ <SitePlaceholder key="site-placeholder" /> ];
		}

		selectorClass = classNames( 'site-selector', 'sites-list', {
			'is-large': isLarge,
			'is-single': hasOneSite
		} );

		return (
			<div className={ selectorClass }>
				<Search
					ref="siteSearch"
					onSearch={ this.onSearch }
					autoFocus={ this.props.autoFocus }
					disabled={ ! sitesInitialized }
				/>
				<div className="site-selector__sites" ref="selector">
					{ this.renderRecentSites() }
					{ siteElements }
				</div>
				{ this.props.showAddNewSite && this.addNewSite() }
			</div>
		);
	}
} );
