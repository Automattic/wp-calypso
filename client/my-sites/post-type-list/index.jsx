/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { difference, get, includes, isEqual, range, size } from 'lodash';
import AutoSizer from 'react-virtualized/AutoSizer';
import WindowScroller from 'react-virtualized/WindowScroller';
import List from 'react-virtualized/List';

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
import { getOpenSharePanels } from 'state/ui/post-type-list/selectors';
import PostItem from 'blocks/post-item';
import PostTypeListEmptyContent from './empty-content';

/**
 * Constants
 */
const DEFAULT_POST_ROW_HEIGHT = 86;
const DEFAULT_SHARE_POST_ROW_HEIGHT = 300;
const DEFAULT_POSTS_PER_PAGE = 20;
const LOAD_OFFSET = 10;

class PostTypeList extends Component {
	static propTypes = {
		query: PropTypes.object,
		siteId: PropTypes.number,
		lastPage: PropTypes.number,
		posts: PropTypes.array,
		requestingLastPage: PropTypes.bool
	};

	constructor() {
		super( ...arguments );

		this.renderPostRow = this.renderPostRow.bind( this );
		this.cellRendererWrapper = this.cellRendererWrapper.bind( this );
		this.renderPlaceholder = this.renderPlaceholder.bind( this );
		this.setRequestedPages = this.setRequestedPages.bind( this );
		this.setListRef = this.setListRef.bind( this );
		this.handleHeightChange = this.handleHeightChange.bind( this );
		this.getPostRowHeight = this.getPostRowHeight.bind( this );

		this.rowHeights = {};

		this.state = {
			requestedPages: this.getInitialRequestedPages( this.props )
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! isEqual( this.props.query, nextProps.query ) ) {
			this.setState( {
				requestedPages: this.getInitialRequestedPages( nextProps )
			} );
		}
	}

	getInitialRequestedPages( props ) {
		// If we have no posts or we're otherwise not expecting any posts to be
		// rendered, request the first page, since setRequestedPages won't be
		// called if row count is 0.
		if ( 0 === size( props.posts ) ) {
			return [ 1 ];
		}

		return [];
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

	renderPlaceholder() {
		return <PostItem key="placeholder" />;
	}

	renderPostRow( { index } ) {
		const { global_ID: globalId } = this.props.posts[ index ];
		return <PostItem key={ globalId } globalId={ globalId } onHeightChange={ this.handleHeightChange } />;
	}

	cellRendererWrapper( { key, style, ...rest } ) {
		return (
			<div key={ key } style={ style }>
				{ this.renderPostRow( rest ) }
			</div>
		);
	}

	setListRef( list ) {
		this.listRef = list;
	}

	handleHeightChange( { globalId, nodeHeight } ) {
		this.rowHeights[ globalId ] = nodeHeight;

		setTimeout( () => {
			this.listRef.recomputeRowHeights( 0 );
		}, 1 );
	}

	getPostRowHeight( { index } ) {
		const { posts, openShares } = this.props;

		if ( ! posts || ! posts[ index ] || ! posts[ index ].global_ID ) {
			return DEFAULT_POST_ROW_HEIGHT;
		}

		const globalId = posts[ index ].global_ID;

		if ( openShares && openShares.indexOf( globalId ) > -1 ) {
			return get( this.rowHeights, globalId ) || DEFAULT_SHARE_POST_ROW_HEIGHT;
		}

		return DEFAULT_POST_ROW_HEIGHT;
	}

	render() {
		const { query, siteId, posts } = this.props;
		const isEmpty = query && posts && ! posts.length && this.isLastPage();
		const classes = classnames( 'post-type-list', {
			'is-empty': isEmpty
		} );

		return (
			<div className={ classes }>
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
					<WindowScroller key={ JSON.stringify( query ) }>
						{ ( { height, scrollTop } ) => (
							<AutoSizer disableHeight>
								{ ( { width } ) => (
									<List
										autoHeight
										scrollTop={ scrollTop }
										height={ height }
										width={ width }
										onRowsRendered={ this.setRequestedPages }
										ref={ this.setListRef }
										rowRenderer={ this.cellRendererWrapper }
										rowHeight={ this.getPostRowHeight }
										rowCount={ size( this.props.posts ) } />
								) }
							</AutoSizer>
						) }
					</WindowScroller>
				) }
				{ ! this.isLastPage() && this.renderPlaceholder() }
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const lastPage = getSitePostsLastPageForQuery( state, siteId, ownProps.query );
	const openShares = getOpenSharePanels( state );

	return {
		siteId,
		lastPage,
		openShares,
		posts: getSitePostsForQueryIgnoringPage( state, siteId, ownProps.query ),
		requestingLastPage: isRequestingSitePostsForQuery( state, siteId, { ...ownProps.query, page: lastPage } )
	};
} )( PostTypeList );
