/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import BlogPostsPage from './blog-posts-page';
import { sortPagesHierarchically } from './helpers';
import Page from './page';
import Placeholder from './placeholder';
import QueryPosts from 'components/data/query-posts';
import EmptyContent from 'components/empty-content';
import ListEnd from 'components/list-end';
import infiniteScroll from 'lib/mixins/infinite-scroll';
import { mapPostStatus as mapStatus } from 'lib/route';
import NoResults from 'my-sites/no-results';
import { getSitePostsForQueryIgnoringPage, isRequestingSitePostsForQuery, isSitePostsLastPageForQuery } from 'state/posts/selectors';
import { hasInitializedSites } from 'state/selectors';
import { getSite } from 'state/sites/selectors';

export default class PageList extends Component {
	static propTypes = {
		search: PropTypes.string,
		siteId: PropTypes.number,
		status: PropTypes.string,
	}

	state = {
		page: 1,
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.search !== this.props.search ||
			nextProps.siteId !== this.props.siteId ||
			nextProps.status !== this.props.status ) {
			this.resetPage();
		}
	}

	incrementPage = () => {
		this.setState( { page: this.state.page + 1 } );
	}

	resetPage = () => {
		this.setState( { page: 1 } );
	}

	render() {
		const {
			search,
			siteId,
			status,
		} = this.props;

		const query = {
			page: this.state.page,
			number: 20, // all-sites mode, i.e the /me/posts endpoint, only supports up to 20 results at a time
			search,
			status: mapStatus( status ),
			type: 'page'
		};

		return (
			<div>
				<QueryPosts siteId={ siteId }
					query={ query } />
				<ConnectedPages
					incrementPage={ this.incrementPage }
					query={ query }
					siteId={ siteId } />
			</div>
		);
	}
}

const Pages = localize( localize( React.createClass( {

	displayName: 'Pages',

	mixins: [ infiniteScroll( 'fetchPages' ) ],

	propTypes: {
		incrementPage: PropTypes.func.isRequired,
		lastPage: PropTypes.bool,
		loading: PropTypes.bool.isRequired,
		page: PropTypes.number.isRequired,
		pages: PropTypes.array.isRequired,
		search: PropTypes.string,
		site: PropTypes.object,
		siteId: PropTypes.any,
		hasSites: PropTypes.bool.isRequired,
		trackScrollPage: PropTypes.func.isRequired,
	},

	getDefaultProps() {
		return {
			perPage: 100,
			loading: false,
			lastPage: false,
			page: 0,
			pages: [],
			trackScrollPage: function() {}
		};
	},

	fetchPages( options ) {
		if ( this.props.loading || this.props.lastPage ) {
			return;
		}
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( this.props.page + 1 );
		}
		this.props.incrementPage();
	},

	_insertTimeMarkers( pages ) {
		const markedPages = [],
			now = this.props.moment();
		let lastMarker;

		const buildMarker = function( pageDate ) {
			pageDate = this.props.moment( pageDate );
			const days = now.diff( pageDate, 'days' );
			if ( days <= 0 ) {
				return this.props.translate( 'Today' );
			}
			if ( days === 1 ) {
				return this.props.translate( 'Yesterday' );
			}
			return pageDate.from( now );
		}.bind( this );

		pages.forEach( function( page ) {
			const date = this.props.moment( page.date ),
				marker = buildMarker( date );
			if ( lastMarker !== marker ) {
				markedPages.push(
					<div key={ 'marker-' + date.unix() } className="pages__page-list-header">
						<Gridicon icon="time" size={ 12 } /> { marker }
					</div>
				);
			}
			lastMarker = marker;
			markedPages.push( page );
		}, this );

		return markedPages;
	},

	getNoContentMessage() {
		const { search, translate } = this.props;

		if ( search ) {
			return (
				<NoResults
					image="/calypso/images/pages/illustration-pages.svg"
					text={
						translate( 'No pages match your search for {{searchTerm/}}.', {
							components: {
								searchTerm: <em>{ search }</em>
							}
						} ) }
				/>
			);
		}

		const { site, siteId, status = 'published' } = this.props;
		const sitePart = site && site.slug || siteId;
		const newPageLink = this.props.siteId ? '/page/' + sitePart : '/page';
		let attributes;

		switch ( status ) {
			case 'drafts':
				attributes = {
					title: translate( 'You don\'t have any drafts.' ),
					line: translate( 'Would you like to create one?' ),
					action: translate( 'Start a Page' ),
					actionURL: newPageLink
				};
				break;
			case 'scheduled':
				attributes = {
					title: translate( 'You don\'t have any scheduled pages yet.' ),
					line: translate( 'Would you like to create one?' ),
					action: translate( 'Start a Page' ),
					actionURL: newPageLink
				};
				break;
			case 'trashed':
				attributes = {
					title: translate( 'You don\'t have any pages in your trash folder.' ),
					line: translate( 'Everything you write is solid gold.' )
				};
				break;
			default:
				attributes = {
					title: translate( 'You haven\'t published any pages yet.' ),
					line: translate( 'Would you like to publish your first page?' ),
					action: translate( 'Start a Page' ),
					actionURL: newPageLink
				};
		}

		attributes.illustration = '/calypso/images/pages/illustration-pages.svg';
		attributes.illustrationWidth = 150;

		return <EmptyContent
			title={ attributes.title }
			line={ attributes.line }
			action={ attributes.action }
			actionURL={ attributes.actionURL }
			illustration={ attributes.illustration }
			illustrationWidth={ attributes.illustrationWidth }
		/>;
	},

	addLoadingRows( rows, count ) {
		for ( let i = 0; i < count; i++ ) {
			if ( i % 4 === 0 ) {
				rows.push( <Placeholder.Marker key={ 'placeholder-marker-' + i } /> );
			}
			rows.push( <Placeholder.Page key={ 'placeholder-page-' + i } multisite={ ! this.props.site } /> );
		}
	},

	renderLoading() {
		const rows = [];
		this.addLoadingRows( rows, 1 );

		return (
			<div id="pages" className="pages__page-list">
				{ rows }
			</div>
		);
	},

	renderPagesList( { pages } ) {
		const { site } = this.props;
		const status = this.props.status || 'published';

		// Pages only display hierarchically for published pages on single-sites when
		// there are 100 or fewer pages and no more pages to load (last page).
		// Pages are not displayed hierarchically for search.
		if ( site && status === 'published' &&
			this.props.lastPage && pages.length <= 100 &&
			! this.props.search ) {
			return this.renderHierarchical( { pages, site } );
		}

		return this.renderChronological( { pages, site } );
	},

	renderHierarchical( { pages, site } ) {
		pages = sortPagesHierarchically( pages );
		const rows = pages.map( function( page ) {
			return (
				<Page key={ 'page-' + page.global_ID } page={ page } site={ site }
					multisite={ false } hierarchical={ true } hierarchyLevel={ page.indentLevel || 0 } />
			);
		}, this );

		return (
			<div id="pages" className="pages__page-list">
				<BlogPostsPage key="blog-posts-page" site={ site } pages={ pages } />
				{ rows }
			</div>
		);
	},

	renderChronological( { pages, site } ) {
		if ( ! this.props.search ) {
			// we're listing in reverse chrono. use the markers.
			pages = this._insertTimeMarkers( pages );
		}
		const rows = pages.map( function( page ) {
			if ( ! ( 'site_ID' in page ) ) {
				return page;
			}

			// Render each page
			return (
				<Page key={ 'page-' + page.global_ID } page={ page } multisite={ this.props.siteId === null } />
			);
		}, this );

		if ( this.props.loading ) {
			this.addLoadingRows( rows, 1 );
		}

		const blogPostsPage = ( site && status === 'published' ) && (
			<BlogPostsPage key="blog-posts-page" site={ site } pages={ pages } />
		);

		return (
			<div id="pages" className="pages__page-list">
				{ blogPostsPage }
				{ rows }
				{ this.props.lastPage && pages.length ? <ListEnd /> : null }
			</div>
		);
	},

	renderNoContent() {
		return (
			<div id="pages" className="pages__page-list">
				<div key="page-list-no-results">{ this.getNoContentMessage() }</div>
			</div>
		);
	},

	render() {
		const {
			hasSites,
			loading,
			pages,
		} = this.props;

		if ( pages.length && hasSites ) {
			return this.renderPagesList( { pages } );
		}

		if ( ( ! loading ) && hasSites ) {
			return this.renderNoContent();
		}

		return this.renderLoading();
	},

} ) ) );

const mapState = ( state, { query, siteId } ) => ( {
	hasSites: hasInitializedSites( state ),
	loading: isRequestingSitePostsForQuery( state, siteId, query ),
	lastPage: isSitePostsLastPageForQuery( state, siteId, query ),
	pages: getSitePostsForQueryIgnoringPage( state, siteId, query ) || [],
	site: getSite( state, siteId ),
} );

const ConnectedPages = connect( mapState )( Pages );
