/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import debugFactory from 'debug';
import scrollIntoView from 'dom-scroll-into-view';
import { localize } from 'i18n-calypso';
import { filter, flow, get, includes, keyBy, noop, size } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SiteSelectorAddSite from './add-site';
import Site from 'blocks/site';
import SitePlaceholder from 'blocks/site/placeholder';
import Search from 'components/search';
import searchSites from 'components/search-sites';
import AllSites from 'my-sites/all-sites';
import { getCurrentUser } from 'state/current-user/selectors';
import { getPreference } from 'state/preferences/selectors';
import { areAllSitesSingleUser, getSites, getVisibleSites, isRequestingMissingSites } from 'state/selectors';
import { isPluginActive } from 'state/selectors';
import { getSite } from 'state/sites/selectors';
import { getSelectedSite } from 'state/ui/selectors';

const ALL_SITES = 'ALL_SITES';

const debug = debugFactory( 'calypso:site-selector' );

class SiteSelector extends Component {
	static propTypes = {
		sites: PropTypes.array,
		siteBasePath: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		showAddNewSite: PropTypes.bool,
		showAllSites: PropTypes.bool,
		indicator: PropTypes.bool,
		autoFocus: PropTypes.bool,
		onClose: PropTypes.func,
		selected: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
		hideSelected: PropTypes.bool,
		filter: PropTypes.func,
		groups: PropTypes.bool,
		onSiteSelect: PropTypes.func,
		showRecentSites: PropTypes.bool,
		recentSites: PropTypes.array,
		selectedSite: PropTypes.object,
		visibleSites: PropTypes.arrayOf( PropTypes.object ),
		allSitesPath: PropTypes.string,
		navigateToSite: PropTypes.func.isRequired,
	};

	static defaultProps = {
		sites: {},
		showAddNewSite: false,
		showAllSites: false,
		siteBasePath: false,
		indicator: false,
		hideSelected: false,
		selected: null,
		onClose: noop,
		onSiteSelect: noop,
		groups: false,
	};

	state = {
		highlightedIndex: -1,
		showSearch: false,
		isKeyboardEngaged: false,
	};

	reset() {
		if ( this.props.sitesFound && this.refs.siteSearch ) {
			this.refs.siteSearch.clear();
		} else {
			this.setState( this.getInitialState() );
		}
	}

	onSearch = terms => {
		this.props.searchSites( terms );

		this.setState( {
			highlightedIndex: terms ? 0 : -1,
			showSearch: terms ? true : this.state.showSearch,
			isKeyboardEngaged: true,
		} );
	};

	componentDidUpdate( prevProps, prevState ) {
		if (
			this.state.isKeyboardEngaged &&
			prevState.highlightedIndex !== this.state.highlightedIndex
		) {
			this.scrollToHighlightedSite();
		}
	}

	scrollToHighlightedSite() {
		const selectorElement = ReactDom.findDOMNode( this.refs.selector );
		if ( selectorElement ) {
			const highlightedSiteElement = ReactDom.findDOMNode( this.refs.highlightedSite );
			if ( highlightedSiteElement ) {
				scrollIntoView( highlightedSiteElement, selectorElement, {
					onlyScrollIfNeeded: true,
				} );
			} else {
				selectorElement.scrollTop = 0;
			}
		}
	}

	computeHighlightedSite() {
		// site can be highlighted by either keyboard or by mouse and
		// we need to switch seemlessly between the two
		let highlightedSiteId, highlightedIndex;
		if ( this.state.isKeyboardEngaged ) {
			debug( 'using highlight from last keyboard interaction' );
			highlightedSiteId = this.visibleSites[ this.state.highlightedIndex ];
			highlightedIndex = this.state.highlightedIndex;
		} else if ( this.lastMouseHover ) {
			debug( `restoring highlight from last mouse hover (${ this.lastMouseHover })` );
			highlightedSiteId = this.props.highlightedSiteId || this.lastMouseHover;
			highlightedIndex = this.visibleSites.indexOf( highlightedSiteId );
		} else {
			debug( 'reseting highlight as mouse left site selector' );
			highlightedSiteId = null;
			highlightedIndex = -1;
		}

		return { highlightedSiteId, highlightedIndex };
	}

	onKeyDown = event => {
		const visibleLength = this.visibleSites.length;

		// ignore keyboard access when there are no results
		// or when manipulating a text selection in input
		if ( visibleLength === 0 || event.shiftKey ) {
			return;
		}

		const { highlightedSiteId, highlightedIndex } = this.computeHighlightedSite();
		let nextIndex = null;

		switch ( event.key ) {
			case 'ArrowUp':
				nextIndex = highlightedIndex - 1;
				if ( nextIndex < 0 ) {
					nextIndex = visibleLength - 1;
				}
				break;
			case 'ArrowDown':
				nextIndex = highlightedIndex + 1;
				if ( nextIndex >= visibleLength ) {
					nextIndex = 0;
				}
				break;
			case 'Enter':
				if ( highlightedSiteId ) {
					if ( highlightedSiteId === ALL_SITES ) {
						this.onSiteSelect( event, ALL_SITES );
					} else {
						this.onSiteSelect( event, highlightedSiteId );
					}
				}
				break;
		}

		if ( nextIndex !== null ) {
			this.lastMouseHover = null;
			this.setState( {
				highlightedIndex: nextIndex,
				isKeyboardEngaged: true,
			} );
		}
	};

	onSiteSelect = ( event, siteId ) => {
		const handledByHost = this.props.onSiteSelect( siteId );
		this.props.onClose( event );

		const node = ReactDom.findDOMNode( this.refs.selector );
		if ( node ) {
			node.scrollTop = 0;
		}

		// Some hosts of this component can properly handle selection and want to call into page themselves (or do
		// any number of things). handledByHost gives them the chance to avoid the simulated navigation,
		// even for touchend
		if ( ! handledByHost ) {
			this.props.navigateToSite( siteId, this.props );
		}
	};

	onAllSitesSelect = event => {
		this.onSiteSelect( event, ALL_SITES );
	};

	onSiteHover = ( event, siteId ) => {
		if ( this.lastMouseHover !== siteId ) {
			debug( `${ siteId } hovered` );
			this.lastMouseHover = siteId;
		}
	};

	onAllSitesHover = () => {
		if ( this.lastMouseHover !== ALL_SITES ) {
			debug( 'ALL_SITES hovered' );
			this.lastMouseHover = ALL_SITES;
		}
	};

	onMouseLeave = () => {
		debug( 'mouse left site selector - nothing hovered anymore' );
		this.lastMouseHover = null;
	};

	onMouseMove = event => {
		// we need to test here if cursor position was actually moved, because
		// mouseMove event can also be triggered by scrolling the parent element
		// and we scroll that element via keyboard access
		if ( event.pageX !== this.lastMouseMoveX || event.pageY !== this.lastMouseMoveY ) {
			this.lastMouseMoveY = event.pageY;
			this.lastMouseMoveX = event.pageX;

			if ( this.state.isKeyboardEngaged ) {
				this.setState( { isKeyboardEngaged: false } );
			}
		}
	};

	isSelected( site ) {
		const selectedSite = this.props.selected || this.props.selectedSite;
		return (
			( site === ALL_SITES && selectedSite === null ) ||
			selectedSite === site.ID ||
			selectedSite === site.domain ||
			selectedSite === site.slug
		);
	}

	isHighlighted( siteId ) {
		return (
			this.state.isKeyboardEngaged &&
			this.visibleSites.indexOf( siteId ) === this.state.highlightedIndex
		);
	}

	shouldShowGroups() {
		return this.props.groups;
	}

	renderSites() {
		let sites;

		// Assume that `sites` is falsy when loading
		if ( this.props.isRequestingMissingSites ) {
			return <SitePlaceholder key="site-placeholder" />;
		}

		if ( this.props.sitesFound ) {
			sites = this.props.sitesFound;
		} else {
			sites = this.props.visibleSites;

			const { showRecentSites, recentSites } = this.props;
			if ( showRecentSites && this.shouldShowGroups() && size( recentSites ) ) {
				sites = filter( sites, ( { ID: siteId } ) => ! includes( recentSites, siteId ) );
			}
		}

		if ( this.props.filter ) {
			sites = sites.filter( this.props.filter );
		}

		if ( this.props.hideSelected && this.props.selected ) {
			sites = sites.filter( site => site.slug !== this.props.selected );
		}

		// Render sites
		const siteElements = sites.map( this.renderSite, this );

		if ( ! siteElements.length ) {
			return (
				<div className="site-selector__no-results">
					{ this.props.translate( 'No sites found' ) }
				</div>
			);
		}

		return siteElements;
	}

	renderAllSites() {
		if ( this.props.showAllSites && ! this.props.sitesFound && this.props.allSitesPath ) {
			this.visibleSites.push( ALL_SITES );

			const isHighlighted = this.isHighlighted( ALL_SITES );
			return (
				<AllSites
					key="selector-all-sites"
					sites={ this.props.sites }
					onSelect={ this.onAllSitesSelect }
					onMouseEnter={ this.onAllSitesHover }
					isHighlighted={ isHighlighted }
					isSelected={ this.isSelected( ALL_SITES ) }
					ref={ isHighlighted ? 'highlightedSite' : null }
				/>
			);
		}
	}

	renderSite( site ) {
		if ( ! site ) {
			return null;
		}

		this.visibleSites.push( site.ID );

		const isHighlighted = this.isHighlighted( site.ID );
		return (
			<Site
				site={ site }
				key={ 'site-' + site.ID }
				indicator={ this.props.indicator }
				onSelect={ this.onSiteSelect }
				onMouseEnter={ this.onSiteHover }
				isHighlighted={ isHighlighted }
				isSelected={ this.isSelected( site ) }
				ref={ isHighlighted ? 'highlightedSite' : null }
			/>
		);
	}

	renderRecentSites() {
		const sitesById = keyBy( this.props.sites, 'ID' );
		const sites = this.props.recentSites.map( siteId => sitesById[ siteId ] );

		if (
			! sites ||
			this.props.sitesFound ||
			! this.shouldShowGroups() ||
			this.props.visibleSiteCount <= 11
		) {
			return null;
		}

		const recentSites = sites.map( this.renderSite, this );

		if ( ! recentSites ) {
			return null;
		}

		return <div className="site-selector__recent">{ recentSites }</div>;
	}

	render() {
		const hiddenSitesCount = this.props.siteCount - this.props.visibleSiteCount;
		const selectorClass = classNames( 'site-selector', 'sites-list', this.props.className, {
			'is-large': this.props.siteCount > 6 || hiddenSitesCount > 0 || this.state.showSearch,
			'is-single': this.props.visibleSiteCount === 1,
			'is-hover-enabled': ! this.state.isKeyboardEngaged,
		} );

		this.visibleSites = [];

		return (
			<div
				className={ selectorClass }
				onMouseMove={ this.onMouseMove }
				onMouseLeave={ this.onMouseLeave }
			>
				<Search
					ref="siteSearch"
					onSearch={ this.onSearch }
					delaySearch={ true }
					autoFocus={ this.props.autoFocus }
					// Assume that `sites` is falsy when loading
					disabled={ ! this.props.sites }
					onSearchClose={ this.props.onClose }
					onKeyDown={ this.onKeyDown }
				/>
				<div className="site-selector__sites" ref="selector">
					{ this.renderAllSites() }
					{ this.renderRecentSites() }
					{ this.renderSites() }
					{ hiddenSitesCount > 0 &&
					! this.props.sitesFound && (
						<span className="site-selector__hidden-sites-message">
							{ this.props.translate(
								'%(hiddenSitesCount)d more hidden site. {{a}}Change{{/a}}.{{br/}}Use search to access it.',
								'%(hiddenSitesCount)d more hidden sites. {{a}}Change{{/a}}.{{br/}}Use search to access them.',
								{
									count: hiddenSitesCount,
									args: {
										hiddenSitesCount: hiddenSitesCount,
									},
									components: {
										br: <br />,
										a: (
											<a
												href="https://dashboard.wordpress.com/wp-admin/index.php?page=my-blogs&show=hidden"
												className="site-selector__manage-hidden-sites"
												target="_blank"
												rel="noopener noreferrer"
											/>
										),
									},
								}
							) }
						</span>
					) }
				</div>
				{ this.props.showAddNewSite && <SiteSelectorAddSite /> }
			</div>
		);
	}
}

const navigateToSite = ( siteId, { allSitesPath, allSitesSingleUser, siteBasePath } ) => (
	dispatch,
	getState
) => {
	const state = getState();
	const pathname = getPathnameForSite();
	if ( pathname ) {
		page( pathname );
	}

	function getPathnameForSite() {
		const site = getSite( state, siteId );
		debug( 'getPathnameForSite', siteId, site );

		if ( siteId === ALL_SITES ) {
			// default posts links to /posts/my when possible and /posts when not
			const postsBase = allSitesSingleUser ? '/posts' : '/posts/my';
			const path = allSitesPath.replace( /^\/posts\b(\/my)?/, postsBase );

			// There is currently no "all sites" version of the insights page
			return path.replace( /^\/stats\/insights\/?$/, '/stats/day' );
		} else if ( siteBasePath ) {
			return getSiteBasePath( site ) + '/' + site.slug;
		}
	}

	function getSiteBasePath( site ) {
		let path = siteBasePath;
		const postsBase = site.jetpack || site.single_user_site ? '/posts' : '/posts/my';

		// Default posts to /posts/my when possible and /posts when not
		path = path.replace( /^\/posts\b(\/my)?/, postsBase );

		// Default stats to /stats/slug when on a 3rd level post/page summary
		if ( path.match( /^\/stats\/(post|page)\// ) ) {
			path = '/stats';
		}

		if ( path.match( /^\/domains\/manage\// ) ) {
			path = '/domains/manage';
		}

		if ( path.match( /^\/store\/stats\// ) ) {
			const isStore = site.jetpack && isPluginActive( state, site.ID, 'woocommerce' );
			if ( ! isStore ) {
				path = '/stats/day';
			}
		}

		return path;
	}
};

const mapState = state => {
	const user = getCurrentUser( state );
	const visibleSiteCount = get( user, 'visible_site_count', 0 );

	return {
		sites: getSites( state ),
		showRecentSites: get( user, 'visible_site_count', 0 ) > 11,
		recentSites: getPreference( state, 'recentSites' ),
		siteCount: get( user, 'site_count', 0 ),
		visibleSiteCount: visibleSiteCount,
		selectedSite: getSelectedSite( state ),
		visibleSites: getVisibleSites( state ),
		allSitesSingleUser: areAllSitesSingleUser( state ),
		isRequestingMissingSites: isRequestingMissingSites( state ),
	};
};

export default flow( localize, searchSites, connect( mapState, { navigateToSite } ) )(
	SiteSelector
);
