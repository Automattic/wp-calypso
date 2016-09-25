/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import page from 'page';
import classNames from 'classnames';
import { get, filter, size, keyBy, map, includes } from 'lodash';

/**
 * Internal dependencies
 */
import { getPreference } from 'state/preferences/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import observe from 'lib/mixins/data-observe';
import AllSites from 'my-sites/all-sites';
import analytics from 'lib/analytics';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import Site from 'blocks/site';
import SitePlaceholder from 'blocks/site/placeholder';
import Search from 'components/search';
import config from 'config';

const noop = () => {};

const SiteSelector = React.createClass( {
	mixins: [ observe( 'sites' ) ],

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
		onSiteSelect: React.PropTypes.func,
		showRecentSites: React.PropTypes.bool,
		recentSites: React.PropTypes.array
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

	onSiteSelect( siteSlug, siteId, event ) {
		this.closeSelector();
		const handledByHost = this.props.onSiteSelect( siteSlug, siteId );
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
			sites = this.props.sites.getVisible();

			const { showRecentSites, recentSites } = this.props;
			if ( showRecentSites && this.shouldShowGroups() && size( recentSites ) ) {
				sites = filter( sites, ( { ID: siteId } ) => ! includes( recentSites, siteId ) );
			}
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
					onSelect={ this.onSiteSelect.bind( this, site.slug, site.ID ) }
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
					{ this.props.showRecentSites && this.renderRecentSites() }
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

			return (
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
		if ( this.state.search || ! this.shouldShowGroups() ) {
			return;
		}

		const sitesById = keyBy( this.props.sites.get(), 'ID' );

		return (
			<div className="site-selector__recent">
				{ map( this.props.recentSites, ( siteId ) => {
					const site = sitesById[ siteId ];
					if ( ! site ) {
						return;
					}

					let siteHref;
					if ( this.props.siteBasePath ) {
						siteHref = this.getSiteBasePath( site ) + '/' + site.slug;
					}

					return (
						<Site
							site={ site }
							href={ siteHref }
							key={ 'site-' + site.ID }
							indicator={ this.props.indicator }
							onSelect={ this.onSiteSelect.bind( this, site.slug, site.ID ) }
							isSelected={ this.isSelected( site ) }
						/>
					);
				} ) }
			</div>
		);
	},

	render() {
		const hiddenSitesCount = this.props.siteCount - this.props.visibleSiteCount;
		const selectorClass = classNames( 'site-selector', 'sites-list', {
			'is-large': this.props.siteCount > 6 || hiddenSitesCount > 0,
			'is-single': this.props.visibleSiteCount === 1
		} );

		return (
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
					{ this.renderSites() }
					{ hiddenSitesCount > 0 && ! this.state.search &&
						<span className="site-selector__hidden-sites-message">
							{ this.translate(
								'%(hiddenSitesCount)d more hidden site. {{a}}Change{{/a}}.{{br/}}Use search to access it.',
								'%(hiddenSitesCount)d more hidden sites. {{a}}Change{{/a}}.{{br/}}Use search to access them.',
								{
									count: hiddenSitesCount,
									args: {
										hiddenSitesCount: hiddenSitesCount
									},
									components: {
										br: <br />,
										a: <a
											href="https://dashboard.wordpress.com/wp-admin/index.php?page=my-blogs&show=hidden"
											className="site-selector__manage-hidden-sites"
											target="_blank"
											rel="noopener noreferrer"
										/>
									}
								}
							) }
						</span>
					}
				</div>
				{ this.props.showAddNewSite && this.addNewSite() }
			</div>
		);
	}
} );

export default connect( ( state ) => {
	const user = getCurrentUser( state );
	const visibleSiteCount = get( user, 'visible_site_count', 0 );
	return {
		showRecentSites: get( user, 'visible_site_count', 0 ) > 11,
		recentSites: getPreference( state, 'recentSites' ),
		siteCount: get( user, 'site_count', 0 ),
		visibleSiteCount: visibleSiteCount,
	};
} )( SiteSelector );
