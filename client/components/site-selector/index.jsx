import page from '@automattic/calypso-router';
import { getUrlParts, getUrlFromParts, determineUrlType, format } from '@automattic/calypso-url';
import { Button } from '@automattic/components';
import Search from '@automattic/search';
import clsx from 'clsx';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { flow } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import AllSites from 'calypso/blocks/all-sites';
import SitePlaceholder from 'calypso/blocks/site/placeholder';
import scrollIntoViewport from 'calypso/lib/scroll-into-viewport';
import { addQueryArgs } from 'calypso/lib/url';
import allSitesMenu from 'calypso/my-sites/sidebar/static-data/all-sites-menu';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import areAllSitesSingleUser from 'calypso/state/selectors/are-all-sites-single-user';
import { canAnySiteHavePlugins } from 'calypso/state/selectors/can-any-site-have-plugins';
import getSites from 'calypso/state/selectors/get-sites';
import getVisibleSites from 'calypso/state/selectors/get-visible-sites';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import { withSitesSortingPreference } from 'calypso/state/sites/hooks/with-sites-sorting';
import { getSite, hasAllSitesList } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import JetpackAgencyAddSite from '../jetpack/add-new-site-button';
import SiteSelectorAddSite from './add-site';
import SitesList from './sites-list';
import { getUserSiteCountForPlatform, getUserVisibleSiteCountForPlatform } from './utils';

import './style.scss';

const ALL_SITES = 'ALL_SITES';
const noop = () => {};
const debug = debugFactory( 'calypso:site-selector' );

export class SiteSelector extends Component {
	static propTypes = {
		isPlaceholder: PropTypes.bool,
		isJetpackAgencyDashboard: PropTypes.bool,
		sites: PropTypes.array,
		siteBasePath: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		wpcomSiteBasePath: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		showAddNewSite: PropTypes.bool,
		showAllSites: PropTypes.bool,
		indicator: PropTypes.bool,
		autoFocus: PropTypes.bool,
		onClose: PropTypes.func,
		selected: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
		hideSelected: PropTypes.bool,
		filter: PropTypes.func,
		groups: PropTypes.bool,
		keepCurrentSection: PropTypes.bool,
		onSiteSelect: PropTypes.func,
		searchPlaceholder: PropTypes.string,
		selectedSite: PropTypes.object,
		visibleSites: PropTypes.arrayOf( PropTypes.object ),
		allSitesPath: PropTypes.string,
		navigateToSite: PropTypes.func.isRequired,
		showManageSitesButton: PropTypes.bool,
		showHiddenSites: PropTypes.bool,
		maxResults: PropTypes.number,
		hasSiteWithPlugins: PropTypes.bool,
		showListBottomAdornment: PropTypes.bool,
	};

	static defaultProps = {
		sites: {},
		showManageSitesButton: false,
		showAddNewSite: false,
		showAllSites: false,
		showHiddenSites: false,
		siteBasePath: false,
		wpcomSiteBasePath: false,
		indicator: false,
		hideSelected: false,
		selected: null,
		onClose: noop,
		onSiteSelect: noop,
		groups: false,
		keepCurrentSection: false,
		autoFocus: false,
		showListBottomAdornment: true,
	};

	state = {
		highlightedIndex: -1,
		showSearch: false,
		isKeyboardEngaged: false,
		searchTerm: '',
	};

	onSearch = ( terms ) => {
		const trimmedTerm = terms.trim();

		this.setState( {
			highlightedIndex: terms ? 0 : -1,
			showSearch: trimmedTerm ? true : this.state.showSearch,
			isKeyboardEngaged: true,
			searchTerm: trimmedTerm,
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
		if ( ! this.siteSelectorRef ) {
			return;
		}

		const selectorElement = ReactDom.findDOMNode( this.siteSelectorRef );

		if ( ! selectorElement ) {
			return;
		}

		// Note: Update CSS selectors if the class names change.
		const highlightedSiteElem = selectorElement.querySelector(
			'.site.is-highlighted, .site-selector .all-sites.is-highlighted'
		);

		if ( ! highlightedSiteElem ) {
			return;
		}

		scrollIntoViewport( highlightedSiteElem, {
			block: 'nearest',
			scrollMode: 'if-needed',
		} );
	}

	computeHighlightedSite() {
		// site can be highlighted by either keyboard or by mouse and
		// we need to switch seemlessly between the two
		let highlightedSiteId;
		let highlightedIndex;
		if ( this.state.isKeyboardEngaged ) {
			debug( 'using highlight from last keyboard interaction' );
			highlightedSiteId = this.visibleSites[ this.state.highlightedIndex ];
			highlightedIndex = this.state.highlightedIndex;
		} else if ( this.lastMouseHover ) {
			debug( `restoring highlight from last mouse hover (${ this.lastMouseHover })` );
			highlightedSiteId = this.props.highlightedSiteId || this.lastMouseHover;
			highlightedIndex = this.visibleSites.indexOf( highlightedSiteId );
		} else {
			debug( 'resetting highlight as mouse left site selector' );
			highlightedSiteId = null;
			highlightedIndex = -1;
		}

		return { highlightedSiteId, highlightedIndex };
	}

	onKeyDown = ( event ) => {
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
		if ( siteId !== ALL_SITES ) {
			const visibleSites = this.visibleSites.filter( ( ID ) => ID !== ALL_SITES );
			this.props.recordTracksEvent( 'calypso_switch_site_click_item', {
				position: visibleSites.indexOf( siteId ) + 1,
				list_item_count: visibleSites.length,
				is_searching: this.state.searchTerm.length > 0,
				sort_key: this.props.sitesSorting.sortKey,
				sort_order: this.props.sitesSorting.sortOrder,
			} );
		}

		const selectedSite = this.props.sites.find( ( site ) => site.ID === siteId );
		const handledByHost = this.props.onSiteSelect( siteId, selectedSite );
		this.props.onClose( event, siteId );

		if ( ! this.siteSelectorRef ) {
			return;
		}

		const node = ReactDom.findDOMNode( this.siteSelectorRef );
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

	onAllSitesSelect = ( event, properties ) => {
		this.props.recordTracksEvent( 'calypso_all_my_sites_click', properties );
		this.onSiteSelect( event, ALL_SITES );
	};

	onManageSitesClick = () => {
		this.props.recordTracksEvent( 'calypso_manage_sites_click' );
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

	onMouseMove = ( event ) => {
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

	isSelected = ( site ) => {
		const selectedSite = this.props.selected || this.props.selectedSite;
		return (
			( site === ALL_SITES && selectedSite === null ) ||
			selectedSite === site.ID ||
			selectedSite === site.domain ||
			selectedSite === site.slug ||
			selectedSite?.ID === site.ID
		);
	};

	isHighlighted = ( siteId ) => {
		return (
			this.state.isKeyboardEngaged &&
			this.visibleSites.indexOf( siteId ) === this.state.highlightedIndex
		);
	};

	shouldShowGroups() {
		return this.props.groups;
	}

	setSiteSelectorRef = ( component ) => ( this.siteSelectorRef = component );

	sitesToBeRendered() {
		let sites =
			this.state.searchTerm || this.props.showHiddenSites
				? this.props.sites
				: this.props.visibleSites;

		if ( this.props.filter ) {
			sites = sites.filter( this.props.filter );
		}

		if ( this.props.hideSelected && this.props.selected ) {
			sites = sites.filter( ( site ) => site.slug !== this.props.selected );
		}

		// Bulk transfers of many domains get attached to a single domain-only site.
		// Because of this, it doesn't make sense to show domain-only sites in the site selector.

		// Eventually, we'll want to filter out domain-only sites at the API boundary instead.
		sites = sites.filter( ( site ) => ! site?.options?.is_domain_only );

		return sites;
	}

	mapAllSitesPath = ( path ) => {
		if ( path.includes( '/posts/my' ) ) {
			return path.replace( '/posts/my', '/posts' );
		}

		return path;
	};

	renderAllSites() {
		if ( ! this.props.showAllSites || this.state.searchTerm || ! this.props.allSitesPath ) {
			return null;
		}

		const multiSiteContext = allSitesMenu( {
			showManagePlugins: this.props.hasSiteWithPlugins,
		} ).find( ( menuItem ) => menuItem.url === this.mapAllSitesPath( this.props.allSitesPath ) );

		// Let's not display the all sites button if there is no multi-site context.
		if ( this.props.showManageSitesButton && ! multiSiteContext ) {
			return null;
		}

		// Let's not display the all sites button if we are already displaying a multi-site context page.
		if ( this.props.showManageSitesButton && ! this.props.selectedSite ) {
			return null;
		}

		this.visibleSites.push( ALL_SITES );

		const isHighlighted = this.isHighlighted( ALL_SITES );

		return (
			<AllSites
				key="selector-all-sites"
				onSelect={ ( event ) =>
					this.onAllSitesSelect(
						event,
						multiSiteContext
							? {
									multi_site_context_slug: multiSiteContext.slug,
							  }
							: undefined
					)
				}
				onMouseEnter={ this.onAllSitesHover }
				isHighlighted={ isHighlighted }
				isSelected={ this.isSelected( ALL_SITES ) }
				title={ multiSiteContext && multiSiteContext.navigationLabel }
				showCount={ ! multiSiteContext?.icon }
				showIcon={ !! multiSiteContext?.icon }
				icon={
					multiSiteContext?.icon && (
						<span className={ 'dashicons-before ' + multiSiteContext.icon } aria-hidden />
					)
				}
			/>
		);
	}

	renderSites( sites ) {
		if ( ! this.props.hasAllSitesList ) {
			return <SitePlaceholder key="site-placeholder" />;
		}

		return (
			<SitesList
				maxResults={ this.props.maxResults }
				addToVisibleSites={ ( siteId ) => this.visibleSites.push( siteId ) }
				searchTerm={ this.state.searchTerm }
				sites={ sites }
				indicator={ this.props.indicator }
				onSelect={ this.onSiteSelect }
				onMouseEnter={ this.onSiteHover }
				isHighlighted={ this.isHighlighted }
				isSelected={ this.isSelected }
			/>
		);
	}

	render() {
		// Render an empty div.site-selector element as a placeholder. It's useful for lazy
		// rendering of the selector in sidebar while keeping the on-appear animation work.
		if ( this.props.isPlaceholder ) {
			return <div className="site-selector" />;
		}

		const hiddenSitesCount = this.props.siteCount - this.props.visibleSiteCount;

		const selectorClass = clsx( 'site-selector', 'sites-list', this.props.className, {
			'is-large': this.props.siteCount > 6 || hiddenSitesCount > 0 || this.state.showSearch,
			'is-single': this.props.visibleSiteCount === 1,
			'is-hover-enabled': ! this.state.isKeyboardEngaged,
		} );

		this.visibleSites = [];

		const sites = this.sitesToBeRendered();

		return (
			<div
				ref={ this.props.forwardRef }
				className={ selectorClass }
				onMouseMove={ this.onMouseMove }
				onMouseLeave={ this.onMouseLeave }
			>
				<Search
					onSearch={ this.onSearch }
					placeholder={ this.props.searchPlaceholder }
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus={ this.props.autoFocus }
					disabled={ ! this.props.hasLoadedSites }
					onSearchClose={ this.props.onClose }
					onKeyDown={ this.onKeyDown }
				/>
				<div className="site-selector__sites" ref={ this.setSiteSelectorRef }>
					{ this.renderAllSites() }
					{ this.renderSites( sites ) }
					{ this.props.showListBottomAdornment &&
						! this.props.showHiddenSites &&
						hiddenSitesCount > 0 &&
						! this.state.searchTerm && (
							<span className="site-selector__list-bottom-adornment">
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
				{ ( this.props.showManageSitesButton || this.props.showAddNewSite ) && (
					<div className="site-selector__actions">
						{ this.props.showManageSitesButton && (
							<Button
								transparent
								onClick={ this.onManageSitesClick }
								href={ addQueryArgs(
									{ search: this.state.searchTerm.length > 0 ? this.state.searchTerm : null },
									'/sites'
								) }
							>
								{ this.props.translate( 'Manage sites' ) }
							</Button>
						) }
						{ this.props.showAddNewSite &&
							( this.props.isJetpackAgencyDashboard ? (
								<JetpackAgencyAddSite
									onClickAddNewSite={ () =>
										this.props.recordTracksEvent(
											'calypso_jetpack_agency_dashboard_sidebar_add_new_site_click'
										)
									}
									onClickWpcomMenuItem={ () =>
										this.props.recordTracksEvent(
											'calypso_jetpack_agency_dashboard_sidebar_create_wpcom_site_click'
										)
									}
									onClickJetpackMenuItem={ () =>
										this.props.recordTracksEvent(
											'calypso_jetpack_agency_dashboard_sidebar_connect_jetpack_site_click'
										)
									}
									onClickBluehostMenuItem={ () =>
										this.props.recordTracksEvent(
											'calypso_jetpack_agency_dashboard_sidebar_create_bluehost_site_click'
										)
									}
								/>
							) : (
								<SiteSelectorAddSite />
							) ) }
					</div>
				) }
			</div>
		);
	}
}

const navigateToSite =
	(
		siteId,
		{ allSitesPath, allSitesSingleUser, keepCurrentSection, siteBasePath, wpcomSiteBasePath }
	) =>
	( dispatch, getState ) => {
		const state = getState();
		const site = getSite( state, siteId );

		const currentSection = state.route?.path?.current?.split( '/' )?.[ 1 ];
		if ( keepCurrentSection && currentSection && siteId !== ALL_SITES ) {
			page( `/${ currentSection }/${ site.slug }` );
			return;
		}

		// We will need to open a new tab if we have wpcomSiteBasePath prop and current site is an Atomic site.
		if ( site?.is_wpcom_atomic && wpcomSiteBasePath ) {
			window.open( getCompleteSiteURL( wpcomSiteBasePath ) );
		} else {
			const pathname = getPathnameForSite();
			if ( pathname ) {
				page( pathname );
			}
		}

		function getPathnameForSite() {
			debug( 'getPathnameForSite', siteId, site );

			if ( siteId === ALL_SITES ) {
				// default posts links to /posts/my when possible and /posts when not
				const postsBase = allSitesSingleUser ? '/posts' : '/posts/my';
				const path = allSitesPath.replace( /^\/posts\b(\/my)?/, postsBase );

				// There is currently no "all sites" version of the insights page
				if ( path.match( /^\/stats\/insights\/?/ ) ) {
					return '/stats/day';
				}

				// Jetpack Cloud: default to /backups/ when in the details of a particular backup
				if ( path.match( /^\/backup\/.*\/(download|restore|contents|granular-restore)/ ) ) {
					return '/backup';
				}

				return path;
			} else if ( siteBasePath ) {
				return getCompleteSiteURL( getSiteBasePath() );
			}
		}

		function getSiteBasePath() {
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

			if ( path.match( /^\/email\// ) ) {
				path = '/email';
			}

			if ( path.match( /^\/store\/stats\// ) ) {
				const isStore = site.jetpack && site.options && site.options.woocommerce_is_active;
				if ( ! isStore ) {
					path = '/stats/day';
				}
			}

			// Defaults to /advertising/campaigns when switching sites in the 3rd level
			if ( path.match( /^\/advertising\/campaigns\/\d+/ ) ) {
				path = '/advertising/campaigns';
			}

			// Jetpack Cloud: default to /backups/ when in the details of a particular backup
			if ( path.match( /^\/backup\/.*\/(download|restore|contents|granular-restore)/ ) ) {
				path = '/backup';
			}

			return path;
		}

		function getCompleteSiteURL( base ) {
			// Record original URL type. The original URL should be a path-absolute URL, e.g. `/posts`.
			const urlType = determineUrlType( base );

			// Get URL parts and modify the path.
			const { origin, pathname: urlPathname, search } = getUrlParts( base );
			const newPathname = `${ urlPathname }/${ site.slug }`;

			try {
				// Get an absolute URL from the original URL, the modified path, and some defaults.
				const absoluteUrl = getUrlFromParts( {
					origin: origin || window.location.origin,
					pathname: newPathname,
					search,
				} );

				// Format the absolute URL down to the original URL type.
				return format( absoluteUrl, urlType );
			} catch {
				// Invalid URLs will cause `getUrlFromParts` to throw. Return `null` in that case.
				return null;
			}
		}
	};

const mapState = ( state ) => {
	const user = getCurrentUser( state );

	return {
		hasLoadedSites: hasLoadedSites( state ),
		sites: getSites( state, false ),
		siteCount: getUserSiteCountForPlatform( user ),
		visibleSiteCount: getUserVisibleSiteCountForPlatform( user ),
		selectedSite: getSelectedSite( state ),
		visibleSites: getVisibleSites( state ),
		allSitesSingleUser: areAllSitesSingleUser( state ),
		hasAllSitesList: hasAllSitesList( state ),
		hasSiteWithPlugins: canAnySiteHavePlugins( state ),
	};
};

export default flow(
	localize,
	withSitesSortingPreference,
	connect( mapState, { navigateToSite, recordTracksEvent } )
)( SiteSelector );
