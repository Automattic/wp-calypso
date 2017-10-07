/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { isEqual, range, throttle } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import QueryPosts from 'components/data/query-posts';
import { DEFAULT_POST_QUERY } from 'lib/query-manager/post/constants';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isRequestingSitePostsForQueryIgnoringPage,
	isRequestingSitePostsForQuery,
	getSitePostsForQueryIgnoringPage,
	getSitePostsLastPageForQuery,
} from 'state/posts/selectors';
import PostItem from 'blocks/post-item';
import PostTypeListEmptyContent from './empty-content';

/**
 * Constants
 */
const debug = debugFactory( 'calypso:post-type-list' );

class PostTypeList extends Component {
	static propTypes = {
		// Props
		query: PropTypes.object,
		largeTitles: PropTypes.bool,
		wrapTitles: PropTypes.bool,
		scrollContainer: PropTypes.object,

		// Connected props
		siteId: PropTypes.number,
		posts: PropTypes.array,
		isRequestingPosts: PropTypes.bool,
		lastPage: PropTypes.number,
		isRequestingLastPage: PropTypes.bool,
	};

	constructor() {
		super( ...arguments );

		this.renderPost = this.renderPost.bind( this );
		this.renderPlaceholder = this.renderPlaceholder.bind( this );

		this.maybeLoadNextPage = this.maybeLoadNextPage.bind( this );
		this.scrollListener = throttle( this.maybeLoadNextPage, 100 );
		window.addEventListener( 'scroll', this.scrollListener );

		const maxRequestedPage = this.estimatePageCountFromPosts( this.props.posts );
		this.state = {
			maxRequestedPage,
		};
		debug( 'init', { maxRequestedPage, posts: this.props.posts } );
	}

	componentWillReceiveProps( nextProps ) {
		if (
			! isEqual( this.props.query, nextProps.query ) ||
			! isEqual( this.props.siteId, nextProps.siteId )
		) {
			const maxRequestedPage = this.estimatePageCountFromPosts( nextProps.posts );
			this.setState( {
				maxRequestedPage,
			} );
			debug( 'reset maxRequestedPage to %d due to query change', maxRequestedPage, {
				prevQuery: this.props.query,
				nextQuery: nextProps.query,
			} );
		}

		const prevLength = this.props.posts && this.props.posts.length;
		const nextLength = nextProps.posts && nextProps.posts.length;
		if ( prevLength !== nextLength ) {
			debug( 'posts.length changed', {
				prevLength,
				nextLength,
				maxRequestedPage: this.state.maxRequestedPage,
				lastPage: nextProps.lastPage,
			} );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.isRequestingPosts && ! this.props.isRequestingPosts ) {
			// We just finished loading a page.  If the bottom of the list is
			// still visible on screen (or almost visible), then we should go
			// ahead and load the next page.
			this.maybeLoadNextPage();
		}
	}

	componentDidMount() {
		this.maybeLoadNextPage();
	}

	componentWillUnmount() {
		window.removeEventListener( 'scroll', this.scrollListener );
		this.scrollListener.cancel(); // Cancel any pending scroll events
	}

	estimatePageCountFromPosts( posts ) {
		// When loading posts from persistent storage, we want to avoid making
		// a bunch of sequential requests when the user scrolls down to the end
		// of the list.  However, we want to still request the posts, in case
		// some data has changed since the last page reload.  This will spawn a
		// number of concurrent requests for different pages of the posts list.

		if ( ! posts || ! posts.length ) {
			return 1;
		}

		const query = this.props.query || {};
		const postsPerPage = query.number || DEFAULT_POST_QUERY.number;
		const pageCount = Math.ceil( posts.length / postsPerPage );

		// Avoid making more than 5 concurrent requests on page load.
		return Math.min( pageCount, 5 );
	}

	getScrollTop() {
		const { scrollContainer } = this.props;
		if ( ! scrollContainer ) {
			return null;
		}
		if ( scrollContainer === document.body ) {
			return 'scrollY' in window ? window.scrollY : document.documentElement.scrollTop;
		}
		return scrollContainer.scrollTop;
	}

	maybeLoadNextPage() {
		const { scrollContainer, lastPage, isRequestingPosts } = this.props;
		if ( ! scrollContainer ) {
			return;
		}
		const scrollTop = this.getScrollTop();
		const { scrollHeight, clientHeight } = scrollContainer;
		if (
			typeof scrollTop !== 'number' ||
			typeof scrollHeight !== 'number' ||
			typeof clientHeight !== 'number'
		) {
			return;
		}
		const pixelsBelowViewport = scrollHeight - scrollTop - clientHeight;
		const { maxRequestedPage } = this.state;
		if ( pixelsBelowViewport <= 200 && maxRequestedPage < lastPage && ! isRequestingPosts ) {
			this.setState( {
				maxRequestedPage: maxRequestedPage + 1,
			} );
			debug( 'incremented maxRequestedPage', {
				maxRequestedPage: maxRequestedPage + 1,
				pixelsBelowViewport,
				lastPage,
			} );
		}
	}

	isLastPage() {
		const { lastPage, isRequestingLastPage } = this.props;
		const { maxRequestedPage } = this.state;

		return maxRequestedPage === lastPage && ! isRequestingLastPage;
	}

	renderPlaceholder() {
		return <PostItem key="placeholder" largeTitle={ this.props.largeTitles } />;
	}

	renderPost( post ) {
		const globalId = post.global_ID;
		const { query } = this.props;

		return (
			<PostItem
				key={ globalId }
				globalId={ globalId }
				largeTitle={ this.props.largeTitles }
				wrapTitle={ this.props.wrapTitles }
				singleUserQuery={ query && !! query.author }
			/>
		);
	}

	render() {
		const { query, siteId, posts, isRequestingPosts, lastPage } = this.props;
		const { maxRequestedPage } = this.state;
		const isLoadedAndEmpty = query && posts && ! posts.length && ! isRequestingPosts;
		const classes = classnames( 'post-type-list', {
			'is-empty': isLoadedAndEmpty,
		} );

		return (
			<div className={ classes }>
				{ query &&
					range( 1, maxRequestedPage + 1 ).map( page => (
						<QueryPosts key={ `query-${ page }` } siteId={ siteId } query={ { ...query, page } } />
					) ) }
				{ posts && posts.map( this.renderPost ) }
				{ isLoadedAndEmpty && (
					<PostTypeListEmptyContent type={ query.type } status={ query.status } />
				) }
				{ (
					maxRequestedPage < lastPage ||
					isRequestingPosts
				) && (
					this.renderPlaceholder()
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
		posts: getSitePostsForQueryIgnoringPage( state, siteId, ownProps.query ),
		isRequestingPosts: isRequestingSitePostsForQueryIgnoringPage( state, siteId, ownProps.query ),
		lastPage,
		isRequestingLastPage: isRequestingSitePostsForQuery( state, siteId, {
			...ownProps.query,
			page: lastPage,
		} ),
	};
} )( PostTypeList );
