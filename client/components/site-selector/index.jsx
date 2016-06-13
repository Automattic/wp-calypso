/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import page from 'page';
import classNames from 'classnames';
import scrollIntoView from 'dom-scroll-into-view';

/**
 * Internal dependencies
 */
import AllSites from 'my-sites/all-sites';
import analytics from 'lib/analytics';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import Site from 'my-sites/site';
import SitePlaceholder from 'my-sites/site/placeholder';
import Search from 'components/search';
import userModule from 'lib/user';
import config from 'config';
import PreferencesData from 'components/data/preferences-data';

const user = userModule();
const noop = () => {};
const ALL_SITES = 'ALL_SITES';

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
			search: '',
			highlightedIndex: 0
		};
	},

	reset() {
		if ( this.state.search && this.refs.siteSearch ) {
			this.refs.siteSearch.clear();
		} else {
			this.setState( this.getInitialState() );
		}
	},

	onSearch( terms ) {
		this.setState( {
			search: terms,
			highlightedIndex: 0
		} );
	},

	componentDidUpdate( prevProps, prevState ) {
		if ( prevState.highlightedIndex !== this.state.highlightedIndex ) {
			this.scrollToHightlightedSite();
		}
	},

	scrollToHightlightedSite() {
		const highlightedSite = this.refs.highlightedSite;
		if ( highlightedSite ) {
			const highlightedSiteElement = ReactDom.findDOMNode( this.refs.highlightedSite );
			const selectorElement = ReactDom.findDOMNode( this.refs.selector );
			if ( highlightedSiteElement && selectorElement ) {
				scrollIntoView( highlightedSiteElement, selectorElement, {
					onlyScrollIfNeeded: true
				} );
			}
		}
	},

	onKeyDown( event ) {
		const highlightedSite = this.visibleSites[ this.state.highlightedIndex ];
		const visibleLength = this.visibleSites.length;

		// ignore keyboard access when there are no results
		// or when manipulating a text selection in input
		if ( visibleLength === 0 || event.shiftKey ) {
			return;
		}

		let nextIndex = null;

		switch ( event.key ) {
			case 'ArrowUp':
				nextIndex = this.state.highlightedIndex - 1;
				if ( nextIndex < 0 ) {
					nextIndex = visibleLength - 1;
				}
				break;
			case 'ArrowDown':
				nextIndex = this.state.highlightedIndex + 1;
				if ( nextIndex >= visibleLength ) {
					nextIndex = 0;
				}
				break;
			case 'Enter':
				if ( highlightedSite ) {
					if ( highlightedSite === ALL_SITES ) {
						this.onSiteSelect( event, ALL_SITES );
					} else {
						this.onSiteSelect( event, highlightedSite.slug );
					}
				}
				break;
		}

		if ( nextIndex !== null ) {
			this.setState( {
				highlightedIndex: nextIndex
			} );
		}
	},

	onSiteSelect( event, siteSlug ) {
		const handledByHost = this.props.onSiteSelect( siteSlug );
		this.props.onClose( event );

		let node = ReactDom.findDOMNode( this.refs.selector );
		if ( node ) {
			node.scrollTop = 0;
		}

		// Some hosts of this component can properly handle selection and want to call into page themselves (or do
		// any number of things). handledByHost gives them the chance to avoid the simulated navigation,
		// even for touchend
		if ( ! handledByHost ) {
			const pathname = this.getPathnameForSite( siteSlug );
			if ( pathname ) {
				// why pathname and not patnname + search? unsure. This currently strips querystrings.
				page( pathname );
			}
		}
	},

	onAllSitesSelect( event ) {
		this.onSiteSelect( event, ALL_SITES );
	},

	recordAddNewSite() {
		analytics.tracks.recordEvent( 'calypso_add_new_wordpress_click' );
	},

	renderNewSiteButton() {
		return (
			<span className="site-selector__add-new-site">
				<Button compact borderless href={ config( 'signup_url' ) + '?ref=calypso-selector' } onClick={ this.recordAddNewSite }>
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

	getPathnameForSite( slug ) {
		const site = this.props.sites.getSite( slug );

		if ( slug === ALL_SITES ) {
			// default posts links to /posts/my when possible and /posts when not
			const postsBase = ( this.props.sites.allSingleSites ) ? '/posts' : '/posts/my';
			let allSitesPath = this.props.allSitesPath.replace( /^\/posts\b(\/my)?/, postsBase );

			// There is currently no "all sites" version of the insights page
			return allSitesPath.replace( /^\/stats\/insights\/?$/, '/stats/day' );
		} else if ( this.props.siteBasePath ) {
			return this.getSiteBasePath( site ) + '/' + site.slug;
		}
	},

	isSelected( site ) {
		var selectedSite = this.props.selected || this.props.sites.selected;
		return (
			( site === ALL_SITES && selectedSite === null ) ||
			( selectedSite === site.domain ) ||
			( selectedSite === site.slug )
		);
	},

	isHighlighted( site ) {
		return this.visibleSites.indexOf( site ) === this.state.highlightedIndex;
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

		if ( this.props.hideSelected && this.props.selected ) {
			sites = sites.filter( site => site.slug !== this.props.selected );
		}

		// Render sites
		siteElements = sites.map( this.renderSite, this );

		if ( ! siteElements.length ) {
			return <div className="site-selector__no-results">{ this.translate( 'No sites found' ) }</div>;
		}

		return siteElements;
	},

	renderAllSites() {
		if ( this.props.showAllSites && ! this.state.search && this.props.allSitesPath ) {
			this.visibleSites.push( ALL_SITES );

			const isHighlighted = this.isHighlighted( ALL_SITES );
			return(
				<AllSites
					key="selector-all-sites"
					sites={ this.props.sites.get() }
					onSelect={ this.onAllSitesSelect }
					isHighlighted={ isHighlighted }
					isSelected={ this.isSelected( ALL_SITES ) }
					ref={ isHighlighted ? 'highlightedSite' : null }
				/>
			);
		}
	},

	renderSite( site ) {
		this.visibleSites.push( site );

		const isHighlighted = this.isHighlighted( site );
		return (
			<Site
				site={ site }
				key={ 'site-' + site.ID }
				indicator={ this.props.indicator }
				onSelect={ this.onSiteSelect }
				isHighlighted={ isHighlighted }
				isSelected={ this.isSelected( site ) }
				ref={ isHighlighted ? 'highlightedSite' : null }
			/>
		);
	},

	renderRecentSites() {
		const sites = this.props.sites.getRecentlySelected();

		if ( ! sites || this.state.search || ! this.shouldShowGroups() || user.get().visible_site_count <= 11 ) {
			return null;
		}

		const recentSites = sites.filter( function( site ) {
			return ! this.props.sites.isStarred( site );
		}, this ).map( this.renderSite, this );

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

		const starredSites = sites.map( this.renderSite, this );

		return (
			<div className="site-selector__starred">
				{ starredSites }
			</div>
		);
	},

	render() {
		const selectorClass = classNames( 'site-selector', 'sites-list', {
			'is-large': true,
			'is-single': user.get().visible_site_count === 1
		} );

		this.visibleSites = [];

		return (
			<PreferencesData>
				<div className={ selectorClass }>
					<Search
						ref="siteSearch"
						onSearch={ this.onSearch }
						autoFocus={ this.props.autoFocus }
						disabled={ ! this.props.sites.initialized }
						onSearchClose={ this.props.onClose }
						onKeyDown={ this.onKeyDown }
					/>
					<div className="site-selector__sites" ref="selector">
						{ this.renderAllSites() }
						{ this.renderRecentSites() }
						{ this.renderStarredSites() }
						{ this.renderSites() }
					</div>
					{ this.props.showAddNewSite && this.renderNewSiteButton() }
				</div>
			</PreferencesData>
		);
	}
} );
