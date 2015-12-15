/**
 * External dependencies
 */
var React = require( 'react' ),
	page = require( 'page' ),
	noop = require( 'lodash/utility/noop' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var AllSites = require( 'my-sites/all-sites' ),
	AddNewButton = require( 'components/add-new-button' ),
	Site = require( 'my-sites/site' ),
	SitePlaceholder = require( 'my-sites/site/placeholder' ),
	Search = require( 'components/search' ),
	user = require( 'lib/user' )(),
	config = require( 'config' );

module.exports = React.createClass( {
	displayName: 'SiteSelector',

	propTypes: {
		showAddNewSite: React.PropTypes.bool,
		showAllSites: React.PropTypes.bool,
		indicator: React.PropTypes.bool,
		autoFocus: React.PropTypes.bool,
		onClose: React.PropTypes.func,
		selected: React.PropTypes.string,
		hideSelected: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			showAddNewSite: false,
			showAllSites: false,
			siteBasePath: false,
			indicator: false,
			hideSelected: false,
			selected: null,
			onClose: noop,
			onSiteSelect: noop
		};
	},

	getInitialState: function() {
		return {
			search: ''
		};
	},

	getCount: function() {
		return user.get().visible_site_count;
	},

	onSearch: function( terms ) {
		this.setState( { search: terms } );
	},

	onSiteSelect: function( siteSlug, event ) {
		this.closeSelector();
		this.props.onSiteSelect( siteSlug );
		this.props.onClose( event );

		// ignore mouse events as the default page() click event will handle navigation
		if ( this.props.siteBasePath && event.type !== 'mouseup' ) {
			page( event.currentTarget.pathname );
		}
	},

	closeSelector: function() {
		this.refs.siteSearch.blur();
	},

	visibleCount: function() {
		return this.props.sites.selected ? 1 : this.getCount();
	},

	// more complex translation logic here
	getTranslations: function() {
		var output = {},
			visibleCount = this.visibleCount();

		if ( ! this.props.sites.selected ) {
			output.selectedSites = this.translate( 'All sites' );
		} else {
			output.selectedSites = this.translate( '%(numberSelected)s site selected', '%(numberSelected)s sites selected', {
				count: visibleCount,
				args: {
					numberSelected: visibleCount
				}
			} );
		}

		output.totalSites = this.translate( '%(numberTotal)s site', 'All %(numberTotal)s Sites', {
			count: this.getCount(),
			args: {
				numberTotal: this.getCount()
			}
		} );

		return output;
	},

	addNewSite: function() {
		return (
			<AddNewButton
				isCompact={ true }
				href={ config( 'signup_url' ) + '?ref=calypso-selector' }
			>
				{ this.translate( 'Add New WordPress' ) }
			</AddNewButton>
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
		return this.props.sites.selected === site.domain || this.props.selected === site.slug;
	},

	renderSiteElements: function() {
		var allSitesPath = this.props.allSitesPath,
			sites, siteElements;

		if ( this.state.search ) {
			sites = this.props.sites.search( this.state.search );
		} else {
			sites = this.props.sites.getVisible();
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
					onSelect={ this.closeSelector }
					isSelected={ ! this.props.sites.selected }
				/>
			);
		}

		return siteElements;
	},

	render: function() {
		var isLarge = this.getCount() > 6,
			hasOneSite = this.getCount() === 1,
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
			<div className={ selectorClass } ref="siteSelector">
				<Search ref="siteSearch" onSearch={ this.onSearch } autoFocus={ this.props.autoFocus } disabled={ ! sitesInitialized } />

				<div className="site-selector__sites">
					{ siteElements.length ? siteElements :
						<div className="site-selector__no-results">{ this.translate( 'No sites found' ) }</div>
					}
				</div>

				{ this.props.showAddNewSite ?
					this.addNewSite()
				: null }
			</div>
		);
	}
} );
