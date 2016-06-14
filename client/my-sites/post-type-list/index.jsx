/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';
import includes from 'lodash/includes';
import difference from 'lodash/difference';
import range from 'lodash/range';
import AutoSizer from 'react-virtualized/AutoSizer';
import WindowScroller from 'react-virtualized/WindowScroller';
import VirtualScroll from 'react-virtualized/VirtualScroll';

/**
 * Internal dependencies
 */
import QueryPosts from 'components/data/query-posts';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isRequestingSitePostsForQuery,
	getSitePostsForQueryIgnoringPage,
	getSitePostsLastPageForQuery
} from 'state/posts/selectors';
import PostTypeListPost from './post';
import PostTypeListPostPlaceholder from './post-placeholder';
import PostTypeListEmptyContent from './empty-content';

/**
 * Constants
 */
const POST_ROW_HEIGHT = 86;
const DEFAULT_POSTS_PER_PAGE = 20;
const LOAD_OFFSET = 10;

class PostTypeList extends Component {
	static propTypes = {
		query: PropTypes.object,
		siteId: PropTypes.number,
		lastPage: PropTypes.number,
		posts: PropTypes.array,
		requestingFirstPage: PropTypes.bool,
		requestingLastPage: PropTypes.bool
	};

	constructor() {
		super( ...arguments );

		this.renderPostRow = this.renderPostRow.bind( this );
		this.setRequestedPages = this.setRequestedPages.bind( this );
		this.setVirtualScrollRef = this.setVirtualScrollRef.bind( this );
		this.state = { requestedPages: [] };
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! isEqual( this.props.query, nextProps.query ) ) {
			this.setState( { requestedPages: [] } );
		}
	}

	componentDidUpdate( prevProps ) {
		// If, after requesting, it turns out that there's only a single post,
		// VirtualScroll may not update because the row count doesn't change
		// (1 placeholder, 1 post result). In these cases, force an update.
		if ( this.props.posts && 1 === this.props.posts.length && this.virtualScroll &&
				! this.props.requestingFirstPage && prevProps.requestingFirstPage ) {
			this.virtualScroll.forceUpdate();
		}
	}

	setVirtualScrollRef( ref ) {
		this.virtualScroll = ref;
	}

	getPageForIndex( index ) {
		const { query, lastPage } = this.props;
		const perPage = query.number || DEFAULT_POSTS_PER_PAGE;
		const page = Math.ceil( index / perPage );

		return Math.max( Math.min( page, lastPage || Infinity ), 1 );
	}

	setRequestedPages( { startIndex, stopIndex } ) {
		if ( ! this.props.query ) {
			return;
		}

		const { requestedPages } = this.state;
		const pagesToRequest = difference( range(
			this.getPageForIndex( startIndex - LOAD_OFFSET ),
			this.getPageForIndex( stopIndex + LOAD_OFFSET ) + 1
		), requestedPages );

		if ( ! pagesToRequest.length ) {
			return;
		}

		this.setState( {
			requestedPages: requestedPages.concat( pagesToRequest )
		} );
	}

	isLastPage() {
		const { lastPage, requestingLastPage } = this.props;
		const { requestedPages } = this.state;

		return includes( requestedPages, lastPage ) && ! requestingLastPage;
	}

	getRowCount() {
		let count = 1;

		if ( this.props.posts ) {
			count += this.props.posts.length;
		}

		if ( this.isLastPage() ) {
			count--;
		}

		return count;
	}

	renderPostRow( { index } ) {
		const { requestingFirstPage, posts } = this.props;
		if ( ! posts || ( requestingFirstPage && 0 === index ) ||
				( ! requestingFirstPage && index >= posts.length ) ) {
			return <PostTypeListPostPlaceholder key="placeholder" />;
		}

		const { global_ID: globalId } = posts[ requestingFirstPage ? index - 1 : index ];
		return <PostTypeListPost key={ globalId } globalId={ globalId } />;
	}

	render() {
		const { query, siteId, posts } = this.props;
		const isEmpty = query && posts && ! posts.length && this.isLastPage();

		return (
			<div className="post-type-list">
				{ query && this.state.requestedPages.map( ( page ) => (
					<QueryPosts
						key={ `query-${ page }` }
						siteId={ siteId }
						query={ { ...query, page } } />
				) ) }
				{ isEmpty && (
					<PostTypeListEmptyContent
						type={ query.type }
						status={ query.status } />
				) }
				{ ! isEmpty && (
					<WindowScroller>
						{ ( { height, scrollTop } ) => (
							<AutoSizer disableHeight>
								{ ( { width } ) => (
									<VirtualScroll
										ref={ this.setVirtualScrollRef }
										autoHeight
										scrollTop={ scrollTop }
										height={ height }
										width={ width }
										onRowsRendered={ this.setRequestedPages }
										rowRenderer={ this.renderPostRow }
										rowHeight={ POST_ROW_HEIGHT }
										rowCount={ this.getRowCount() }
										className="post-type-list__posts" />
								) }
							</AutoSizer>
						) }
					</WindowScroller>
				) }
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const lastPage = getSitePostsLastPageForQuery( state, siteId, ownProps.query );

	return {
		siteId,
		lastPage,
		posts: getSitePostsForQueryIgnoringPage( state, siteId, ownProps.query ),
		requestingFirstPage: isRequestingSitePostsForQuery( state, siteId, { ...ownProps.query, page: 1 } ),
		requestingLastPage: isRequestingSitePostsForQuery( state, siteId, { ...ownProps.query, page: lastPage } )
	};
} )( PostTypeList );
