/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import page from 'page';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import AllSites from 'my-sites/all-sites';
import analytics from 'lib/analytics';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import Site from 'blocks/site';
import SitePlaceholder from 'blocks/site/placeholder';
import Search from 'components/search';
import userModule from 'lib/user';
import config from 'config';
import PreferencesData from 'components/data/preferences-data';

const user = userModule();
const noop = () => {};

export default React.createClass( {
	displayName: 'SiteSelector',

	propTypes: {
		sites: React.PropTypes.object,
		siteBasePath: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.bool ] ),
		showAddNewSite: React.PropTypes.bool,
		showAllSites: React.PropTypes.bool,
		indicator: React.PropTypes.bool,
		autoFocus: React.PropTypes.bool,
		onClose: React.PropTypes.func,
		selected: React.PropTypes.string,
		hideSelected: React.PropTypes.bool,
		filter: React.PropTypes.func,
		groups: React.PropTypes.bool,
		onSiteSelect: React.PropTypes.func
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

	onSiteSelect( siteSlug, event ) {
		this.closeSelector();
		const handledByHost = this.props.onSiteSelect( siteSlug );
		this.props.onClose( event );

		let node = ReactDom.findDOMNode( this.refs.selector );
		if ( node ) {
			node.scrollTop = 0;
		}

		// ignore mouse events as the default page() click event will handle navigation
		// You'll likely wonder what's going on here. Why mouseup, and not click or touchend?
		// The underlying thing generating the click is a my-sites/site, which is using onTouchTap
		// onTouchTap is listening for either mouseup or touchend, depending on the device.
		// the Site handles the event and then prevents it. In the case of mouseup, this does nothing,
		// but for touchend, it cancels the subsequent click.
		// This bit of code is an attempt to make up for that cancellation of touchend. It simulates the navigation
		// that would have happened
		// But some hosts of this component can properly handle selection and want to call into page themselves (or so
		// any number of things ). handledByHost gives them the chance to avoid the simulated navigation,
		// even for touchend
		if ( ! handledByHost && this.props.siteBasePath && ( ! ( event.type === 'mouseup' ) ) ) {
			// why pathname and not patnname + search? unsure. This currently strips querystrings.
			page( event.currentTarget.pathname );
		}
	},

	closeSelector() {
		this.refs.siteSearch.blur();
	},

	recordAddNewSite() {
		analytics.tracks.recordEvent( 'calypso_add_new_wordpress_click' );
	},

	addNewSite() {
		return (
			<span className="site-selector__add-new-site">
				<Button compact borderless href={ config( 'signup_url' ) + '?ref=calypso-selector' } onClick={ this.recordAddNewSite }>
					<Gridicon icon="add-outline" /> { this.translate( 'Add New Site' ) }
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

	isSelected( site ) {
		var selectedSite = this.props.selected || this.props.sites.selected;
		return selectedSite === site.domain || selectedSite === site.slug;
	},

	shouldShowGroups() {
		return this.props.groups;
	},

	renderSites() {
		var sites, siteElements;

		if ( ! this.props.sites.initialized ) {
			return <SitePlaceholder key="site-placeholder" />;
		}

		if ( this.state.search ) {
			sites = this.props.sites.search( this.state.search );
		} else {
			sites = this.shouldShowGroups()
				? this.props.sites.getVisibleAndNotRecent()
				: this.props.sites.getVisible();
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

		if ( ! siteElements.length ) {
			return <div className="site-selector__no-results">{ this.translate( 'No sites found' ) }</div>;
		}

		if ( this.shouldShowGroups() && ! this.state.search ) {
			return (
				<div>
					{ user.get().visible_site_count > 11 && this.renderRecentSites() }
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
					sites={ this.props.sites.get() }
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

		const recentSites = sites.filter( function( site ) {
			return ! this.props.sites.isStarred( site );
		}, this ).map( function( site ) {
			var siteHref;

			if ( this.props.siteBasePath ) {
				siteHref = this.getSiteBasePath( site ) + '/' + site.slug;
			}

			const isSelected = this.isSelected( site );

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

		if ( ! recentSites ) {
			return null;
		}

		return <div className="site-selector__recent">{ recentSites }</div>;
	},

	renderStarredSites() {
		const sites = this.props.sites.getStarred();

		if ( ! sites || this.state.search || ! this.shouldShowGroups() || ! this.props.sites.starred.length ) {
			return null;
		}

		const starredSites = sites.map( function( site ) {
			var siteHref;

			if ( this.props.siteBasePath ) {
				siteHref = this.getSiteBasePath( site ) + '/' + site.slug;
			}

			return (
				<Site
					site={ site }
					href={ siteHref }
					key={ 'site-' + site.ID }
					indicator={ this.props.indicator }
					onSelect={ this.onSiteSelect.bind( this, site.slug ) }
					isSelected={ this.isSelected( site ) }
				/>
			);
		}, this );

		return (
			<div className="site-selector__starred">
				{ starredSites }
			</div>
		);
	},

	render() {
		const selectorClass = classNames( 'site-selector', 'sites-list', {
			'is-large': user.get().site_count > 6,
			'is-single': user.get().visible_site_count === 1
		} );

		return (
			<PreferencesData>
				<div className={ selectorClass }>
					<Search
						ref="siteSearch"
						onSearch={ this.onSearch }
						autoFocus={ this.props.autoFocus }
						disabled={ ! this.props.sites.initialized }
						onSearchClose={ this.props.onClose }
					/>
					<div className="site-selector__sites" ref="selector">
						{ this.renderAllSites() }
						{ this.renderStarredSites() }
						{ this.renderSites() }
					</div>
					{ this.props.showAddNewSite && this.addNewSite() }
				</div>
			</PreferencesData>
		);
	}
} );
