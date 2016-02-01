/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import page from 'page';
import noop from 'lodash/utility/noop';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import AllSites from 'my-sites/all-sites';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import Site from 'my-sites/site';
import SitePlaceholder from 'my-sites/site/placeholder';
import Search from 'components/search';
import userModule from 'lib/user';
import config from 'config';

const user = userModule();

export default React.createClass( {
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

	getDefaultProps() {
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

	getInitialState() {
		return {
			search: ''
		};
	},

	onSearch( terms ) {
		this.setState( { search: terms } );
	},

	onKeyDown( event ) {
		var filteredSites;

		if ( event.keyCode === 13 ) {
			// enter key
			filteredSites = this.getFilteredSites();

			if ( filteredSites.length === 1 && this.props.siteBasePath ) {
				this.onSiteSelect( filteredSites[ 0 ].slug, event );
				page( this.getSiteBasePath( filteredSites[ 0 ] ) + '/' + filteredSites[ 0 ].slug );
			}
		}
	},

	onSiteSelect( siteSlug, event ) {
		this.closeSelector();
		this.props.onSiteSelect( siteSlug );
		this.props.onClose( event );
		ReactDom.findDOMNode( this.refs.selector ).scrollTop = 0;

		// ignore mouse events as the default page() click event will handle navigation
		if ( this.props.siteBasePath && event.type !== 'mouseup' ) {
			page( event.currentTarget.pathname );
		}
	},

	closeSelector() {
		this.refs.siteSearch.blur();
	},

	addNewSite() {
		return (
			<span className="site-selector__add-new-site">
				<Button compact borderless href={ config( 'signup_url' ) + '?ref=calypso-selector' }>
					<Gridicon icon="add-outline" /> { this.translate( 'Add New WordPress' ) }
				</Button>
			</span>
		);
	},

	getSiteBasePath( site ) {
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

	getFilteredSites() {
		var sites;

		if ( this.state.search ) {
			sites = this.props.sites.search( this.state.search );
		} else {
			sites = this.shouldShowGroups() ? this.props.sites.getVisibleAndNotRecent() : this.props.sites.getVisible();
		}

		if ( this.props.filter ) {
			sites = sites.filter( this.props.filter );
		}

		return sites;
	},

	isSelected( site ) {
		var selectedSite = this.props.selected || this.props.sites.selected;
		return selectedSite === site.domain || selectedSite === site.slug;
	},

	shouldShowGroups() {
		if ( ! config.isEnabled( 'show-site-groups' ) ) {
			return false;
		}

		return this.props.groups && user.get().visible_site_count > 14;
	},

	renderSites() {
		var sites = this.getFilteredSites(),
			siteElements;

		if ( ! this.props.sites.initialized ) {
			return <SitePlaceholder key="site-placeholder" />;
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
		}

		return siteElements;
	},

	renderAllSites() {
		if ( this.props.showAllSites && ! this.state.search && this.props.allSitesPath ) {
			// default posts links to /posts/my when possible and /posts when not
			const postsBase = ( this.props.sites.allSingleSites ) ? '/posts' : '/posts/my';
			let allSitesPath = this.props.allSitesPath.replace( /^\/posts\b(\/my)?/, postsBase );

			// There is currently no "all sites" version of the insights page
			allSitesPath = allSitesPath.replace( /^\/stats\/insights\/?$/, '/stats/day' );

			return(
				<AllSites
					key="selector-all-sites"
					sites={ this.props.sites }
					href={ allSitesPath }
					onSelect={ this.onSiteSelect.bind( this, null ) }
					isSelected={ ! this.props.sites.selected }
				/>
			);
		}
	},

	renderRecentSites() {
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

	render() {
		const selectorClass = classNames( 'site-selector', 'sites-list', {
			'is-large': user.get().site_count > 6,
			'is-single': user.get().visible_site_count === 1
		} );

		return (
			<div className={ selectorClass }>
				<Search
					ref="siteSearch"
					onSearch={ this.onSearch }
					onKeyDown={ this.onKeyDown }
					autoFocus={ this.props.autoFocus }
					disabled={ ! this.props.sites.initialized }
				/>
				<div className="site-selector__sites" ref="selector">
					{ this.renderAllSites() }
					{ this.renderRecentSites() }
					{ this.renderSites() }
				</div>
				{ this.props.showAddNewSite && this.addNewSite() }
			</div>
		);
	}
} );
