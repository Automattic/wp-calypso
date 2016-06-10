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
const ALL_SITES = 'ALL_SITES';

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
			search: '',
			highlightedSite: null
		};
	},

	onSearch( terms ) {
		this.setState( { search: terms } );
	},

	componentDidUpdate( prevProps, prevState ) {
		if ( this.state.search !== prevState.search ) {
			this.setState( {
				highlightedSite: this.visibleSites[ 0 ] || null
			}, () => {
				this.scrollToHightlightedSite();
			} );
		} else if ( prevState.highlightedSite !== this.state.highlightedSite ) {
			this.scrollToHightlightedSite();
		}
	},

	scrollToHightlightedSite() {
		const selectedSite = this.refs.selectedSite;
		if ( selectedSite ) {
			const selectedSiteElement = ReactDom.findDOMNode( this.refs.selectedSite );
			if ( typeof selectedSiteElement.scrollIntoViewIfNeeded === 'function' ) {
				selectedSiteElement.scrollIntoViewIfNeeded();
			} else {
				selectedSiteElement.scrollIntoView();
			}
		}
	},

	componentDidMount() {
		if ( this.visibleSites.length > 0 ) {
			this.setState( {
				highlightedSite: this.visibleSites[ 0 ]
			} );
		}
	},

	onKeyDown( event ) {
		const highlightedIndex = this.visibleSites.indexOf( this.state.highlightedSite );
		const visibleLength = this.visibleSites.length;

		// ignore keyboard access when there are no results
		// or when manipulating a text selection in input
		if ( visibleLength === 0 || event.shiftKey ) {
			return;
		}

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
				if ( highlightedIndex > -1 ) {
					if ( this.state.highlightedSite === ALL_SITES ) {
						this.onSiteSelect( ALL_SITES, event );
					} else {
						this.onSiteSelect( this.state.highlightedSite.slug, event );
					}
				}
				break;
		}

		if ( nextIndex !== null ) {
			this.setState( {
				highlightedSite: this.visibleSites[ nextIndex ]
			} );
		}
	},

	onSiteSelect( siteSlug, event ) {
		this.closeSelector();
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

	closeSelector() {
		this.refs.siteSearch.blur();
	},

	recordAddNewSite() {
		analytics.tracks.recordEvent( 'calypso_add_new_wordpress_click' );
	},

	renderNewSiteButton() {
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
		return site === this.state.highlightedSite;
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

		if ( this.props.hideSelected && this.props.selected ) {
			sites = sites.filter( site => site.slug !== this.props.selected );
		}

		// Render sites
		siteElements = sites.map( this.renderSite, this );

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
			this.visibleSites.push( ALL_SITES );

			const isSelected = this.isSelected( ALL_SITES );
			return(
				<AllSites
					key="selector-all-sites"
					sites={ this.props.sites.get() }
					onSelect={ this.onSiteSelect.bind( this, ALL_SITES ) }
					isSelected={ isSelected }
					ref={ isSelected ? 'selectedSite' : null }
				/>
			);
		}
	},

	renderSite( site ) {
		this.visibleSites.push( site );

		const isSelected = this.isSelected( site );
		return (
			<Site
				site={ site }
				key={ 'site-' + site.ID }
				indicator={ this.props.indicator }
				onSelect={ this.onSiteSelect.bind( this, site.slug ) }
				isSelected={ isSelected }
				ref={ isSelected ? 'selectedSite' : null }
			/>
		);
	},

	renderRecentSites() {
		const sitesById = keyBy( this.props.sites.get(), 'ID' );
		const sites = this.props.recentSites.map( (siteId) => sitesById[ siteId ] );

		if ( ! sites || this.state.search || ! this.shouldShowGroups() || this.props.visibleSiteCount <= 11 ) {
			return null;
		}

		const recentSites = sites.map( this.renderSite, this );

		if ( ! recentSites ) {
			return null;
		}

		return <div className="site-selector__recent">{ recentSites }</div>;
	},

	render() {
		const hiddenSitesCount = this.props.siteCount - this.props.visibleSiteCount;
		const selectorClass = classNames( 'site-selector', 'sites-list', {
			'is-large': this.props.siteCount > 6 || hiddenSitesCount > 0,
			'is-single': this.props.visibleSiteCount === 1
		} );

		this.visibleSites = [];

		return (
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
				{ this.props.showAddNewSite && this.renderNewSiteButton() }
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
