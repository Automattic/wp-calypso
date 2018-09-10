/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import GridiconTime from 'gridicons/dist/time';
import { flowRight, isEqual, size, without } from 'lodash';

/**
 * Internal dependencies
 */
import ListEnd from 'components/list-end';
import QueryPosts from 'components/data/query-posts';
import Page from './page';
import { preload } from 'sections-helper';
import InfiniteScroll from 'components/infinite-scroll';
import EmptyContent from 'components/empty-content';
import NoResults from 'my-sites/no-results';
import Placeholder from './placeholder';
import { mapPostStatus as mapStatus } from 'lib/route';
import { sortPagesHierarchically } from './helpers';
import BlogPostsPage from './blog-posts-page';
import hasInitializedSites from 'state/selectors/has-initialized-sites';
import {
	getPostsForQueryIgnoringPage,
	isRequestingPostsForQuery,
	isPostsLastPageForQuery,
} from 'state/posts/selectors';
import { getSite } from 'state/sites/selectors';

function preloadEditor() {
	preload( 'post-editor' );
}

export default class PageList extends Component {
	static propTypes = {
		search: PropTypes.string,
		siteId: PropTypes.number,
		status: PropTypes.string,
	};

	state = {
		page: 1,
	};

	componentWillReceiveProps( nextProps ) {
		if (
			nextProps.search !== this.props.search ||
			nextProps.siteId !== this.props.siteId ||
			nextProps.status !== this.props.status
		) {
			this.resetPage();
		}
	}

	incrementPage = () => {
		this.setState( { page: this.state.page + 1 } );
	};

	resetPage = () => {
		this.setState( { page: 1 } );
	};

	render() {
		const { search, siteId, status } = this.props;

		const query = {
			page: this.state.page,
			number: 20, // all-sites mode, i.e the /me/posts endpoint, only supports up to 20 results at a time
			search,
			status: mapStatus( status ),
			type: 'page',
		};

		return (
			<div>
				<QueryPosts siteId={ siteId } query={ query } />
				<ConnectedPages incrementPage={ this.incrementPage } query={ query } siteId={ siteId } />
			</div>
		);
	}
}

class Pages extends Component {
	static propTypes = {
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
		query: PropTypes.object,
	};

	static defaultProps = {
		perPage: 100,
		loading: false,
		lastPage: false,
		page: 0,
		pages: [],
		trackScrollPage: function() {},
		query: {},
	};

	state = {
		pages: this.props.pages,
		shadowItems: {},
	};

	componentWillReceiveProps( nextProps ) {
		if (
			nextProps.pages !== this.props.pages &&
			( size( this.state.shadowItems ) === 0 || ! isEqual( nextProps.query, this.props.query ) )
		) {
			this.setState( { pages: nextProps.pages, shadowItems: {} } );
		}
	}

	fetchPages = options => {
		if ( this.props.loading || this.props.lastPage ) {
			return;
		}
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( this.props.page + 1 );
		}
		this.props.incrementPage();
	};

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
						<GridiconTime size={ 12 } /> { marker }
					</div>
				);
			}
			lastMarker = marker;
			markedPages.push( page );
		}, this );

		return markedPages;
	}

	updateShadowStatus = ( globalID, shadowStatus ) =>
		new Promise( resolve =>
			this.setState( ( state, props ) => {
				if ( shadowStatus ) {
					// add or update the `globalID` key in the `shadowItems` map
					return {
						shadowItems: {
							...state.shadowItems,
							[ globalID ]: shadowStatus,
						},
					};
				}

				// remove `globalID` from the `shadowItems` map
				const newShadowItems = without( state.shadowItems, globalID );
				const newState = {
					shadowItems: newShadowItems,
				};

				// if the last shadow item just got removed, start showing the up-to-date post
				// list as specified by props.
				if ( size( newShadowItems ) === 0 ) {
					newState.pages = props.pages;
				}

				return newState;
			}, resolve )
		);

	getNoContentMessage() {
		const { query, translate, site, siteId } = this.props;
		const { search, status } = query;

		if ( search ) {
			return (
				<NoResults
					image="/calypso/images/pages/illustration-pages.svg"
					text={ translate( 'No pages match your search for {{searchTerm/}}.', {
						components: {
							searchTerm: <em>{ search }</em>,
						},
					} ) }
				/>
			);
		}

		const sitePart = ( site && site.slug ) || siteId;
		const newPageLink = siteId ? '/page/' + sitePart : '/page';
		let attributes;

		switch ( status ) {
			case 'draft,pending':
				attributes = {
					title: translate( "You don't have any drafts." ),
					line: translate( 'Would you like to create one?' ),
					action: translate( 'Start a Page' ),
					actionURL: newPageLink,
				};
				break;
			case 'future':
				attributes = {
					title: translate( "You don't have any scheduled pages yet." ),
					line: translate( 'Would you like to create one?' ),
					action: translate( 'Start a Page' ),
					actionURL: newPageLink,
				};
				break;
			case 'trash':
				attributes = {
					title: translate( "You don't have any pages in your trash folder." ),
					line: translate( 'Everything you write is solid gold.' ),
				};
				break;
			default:
				attributes = {
					title: translate( "You haven't published any pages yet." ),
					line: translate( 'Would you like to publish your first page?' ),
					action: translate( 'Start a Page' ),
					actionURL: newPageLink,
				};
		}

		attributes.illustration = '/calypso/images/pages/illustration-pages.svg';
		attributes.illustrationWidth = 150;

		return (
			<EmptyContent
				title={ attributes.title }
				line={ attributes.line }
				action={ attributes.action }
				actionURL={ attributes.actionURL }
				actionHoverCallback={ preloadEditor }
				illustration={ attributes.illustration }
				illustrationWidth={ attributes.illustrationWidth }
			/>
		);
	}

	addLoadingRows( rows, count ) {
		for ( let i = 0; i < count; i++ ) {
			if ( i % 4 === 0 ) {
				rows.push( <Placeholder.Marker key={ 'placeholder-marker-' + i } /> );
			}
			rows.push(
				<Placeholder.Page key={ 'placeholder-page-' + i } multisite={ ! this.props.site } />
			);
		}
	}

	renderLoading() {
		const rows = [];
		this.addLoadingRows( rows, 1 );

		return (
			<div id="pages" className="pages__page-list">
				{ rows }
			</div>
		);
	}

	renderListEnd() {
		return this.props.lastPage && ! this.props.loading ? <ListEnd /> : null;
	}

	renderPagesList( { pages } ) {
		const { site, lastPage, query } = this.props;

		// Pages only display hierarchically for published pages on single-sites when
		// there are 100 or fewer pages and no more pages to load (last page).
		// Pages are not displayed hierarchically for search.
		const showHierarchical =
			site &&
			query.status === 'publish,private' &&
			lastPage &&
			pages.length <= 100 &&
			! query.search;

		return showHierarchical
			? this.renderHierarchical( { pages, site } )
			: this.renderChronological( { pages, site } );
	}

	renderHierarchical( { pages, site } ) {
		pages = sortPagesHierarchically( pages );
		const rows = pages.map( function( page ) {
			return (
				<Page
					key={ 'page-' + page.global_ID }
					shadowStatus={ this.state.shadowItems[ page.global_ID ] }
					onShadowStatusChange={ this.updateShadowStatus }
					page={ page }
					multisite={ false }
					hierarchical={ true }
					hierarchyLevel={ page.indentLevel || 0 }
				/>
			);
		}, this );

		return (
			<div id="pages" className="pages__page-list">
				<BlogPostsPage key="blog-posts-page" site={ site } pages={ pages } />
				{ rows }
				{ this.renderListEnd() }
			</div>
		);
	}

	renderChronological( { pages, site } ) {
		const { search, status } = this.props.query;

		if ( ! search ) {
			// we're listing in reverse chrono. use the markers.
			pages = this._insertTimeMarkers( pages );
		}
		const rows = pages.map( function( page ) {
			if ( ! ( 'site_ID' in page ) ) {
				return page;
			}

			// Render each page
			return (
				<Page
					key={ 'page-' + page.global_ID }
					shadowStatus={ this.state.shadowItems[ page.global_ID ] }
					onShadowStatusChange={ this.updateShadowStatus }
					page={ page }
					multisite={ this.props.siteId === null }
				/>
			);
		}, this );

		if ( this.props.loading ) {
			this.addLoadingRows( rows, 1 );
		}

		const showBlogPostsPage = site && status === 'publish,private' && ! search;

		return (
			<div id="pages" className="pages__page-list">
				{ showBlogPostsPage && (
					<BlogPostsPage key="blog-posts-page" site={ site } pages={ pages } />
				) }
				{ rows }
				<InfiniteScroll nextPageMethod={ this.fetchPages } />
				{ this.renderListEnd() }
			</div>
		);
	}

	renderNoContent() {
		return (
			<div id="pages" className="pages__page-list">
				<div key="page-list-no-results">{ this.getNoContentMessage() }</div>
			</div>
		);
	}

	render() {
		const { hasSites, loading } = this.props;
		const { pages } = this.state;

		if ( pages.length && hasSites ) {
			return this.renderPagesList( { pages } );
		}

		if ( ! loading && hasSites ) {
			return this.renderNoContent();
		}

		return this.renderLoading();
	}
}

const mapState = ( state, { query, siteId } ) => ( {
	hasSites: hasInitializedSites( state ),
	loading: isRequestingPostsForQuery( state, siteId, query ),
	lastPage: isPostsLastPageForQuery( state, siteId, query ),
	pages: getPostsForQueryIgnoringPage( state, siteId, query ) || [],
	site: getSite( state, siteId ),
} );

const ConnectedPages = flowRight(
	connect( mapState ),
	localize
)( Pages );
