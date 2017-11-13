/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { isEqual, range, throttle } from 'lodash';

/**
 * Internal dependencies
 */
import QueryPosts from 'components/data/query-posts';
import { DEFAULT_POST_QUERY } from 'lib/query-manager/post/constants';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isRequestingSitePostsForQueryIgnoringPage,
	getSitePostsForQueryIgnoringPage,
	getSitePostsFoundForQuery,
	getSitePostsLastPageForQuery,
} from 'state/posts/selectors';
import ListEnd from 'components/list-end';
import PostItem from 'blocks/post-item';
import PostTypeListEmptyContent from './empty-content';
import PostTypeListMaxPagesNotice from './max-pages-notice';

/**
 * Constants
 */
// When this many pixels or less are below the viewport, begin loading the next
// page of items.
const LOAD_NEXT_PAGE_THRESHOLD_PIXELS = 400;
// The maximum number of pages of results that can be displayed in "All My
// Sites" (API endpoint limitation).
const MAX_ALL_SITES_PAGES = 10;

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
		totalPostCount: PropTypes.number,
		totalPageCount: PropTypes.number,
		lastPageToRequest: PropTypes.number,
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

		const postsPerPage = this.getPostsPerPageCount();
		const pageCount = Math.ceil( posts.length / postsPerPage );

		// Avoid making more than 5 concurrent requests on page load.
		return Math.min( pageCount, 5 );
	}

	getPostsPerPageCount() {
		const query = this.props.query || {};
		return query.number || DEFAULT_POST_QUERY.number;
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

	hasListFullyLoaded() {
		const { lastPageToRequest, isRequestingPosts } = this.props;
		const { maxRequestedPage } = this.state;

		return ! isRequestingPosts && maxRequestedPage >= lastPageToRequest;
	}

	maybeLoadNextPage() {
		const { scrollContainer, lastPageToRequest, isRequestingPosts } = this.props;
		const { maxRequestedPage } = this.state;
		if ( ! scrollContainer || isRequestingPosts || maxRequestedPage >= lastPageToRequest ) {
			return;
		}

		const scrollTop = this.getScrollTop();
		const { scrollHeight, clientHeight } = scrollContainer;
		const pixelsBelowViewport = scrollHeight - scrollTop - clientHeight;
		if (
			typeof scrollTop !== 'number' ||
			typeof scrollHeight !== 'number' ||
			typeof clientHeight !== 'number' ||
			pixelsBelowViewport > LOAD_NEXT_PAGE_THRESHOLD_PIXELS
		) {
			return;
		}

		this.setState( { maxRequestedPage: maxRequestedPage + 1 } );
	}

	renderListEnd() {
		return <ListEnd />;
	}

	renderMaxPagesNotice() {
		const { siteId, totalPageCount, totalPostCount } = this.props;
		const isTruncated =
			null === siteId && this.hasListFullyLoaded() && totalPageCount > MAX_ALL_SITES_PAGES;

		if ( ! isTruncated ) {
			return null;
		}

		const displayedPosts = this.getPostsPerPageCount() * MAX_ALL_SITES_PAGES;

		return (
			<PostTypeListMaxPagesNotice displayedPosts={ displayedPosts } totalPosts={ totalPostCount } />
		);
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
		const { query, siteId, posts, isRequestingPosts } = this.props;
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
				{ this.renderMaxPagesNotice() }
				{ this.hasListFullyLoaded() ? this.renderListEnd() : this.renderPlaceholder() }
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );

	const totalPageCount = getSitePostsLastPageForQuery( state, siteId, ownProps.query );
	const lastPageToRequest =
		siteId === null ? Math.min( MAX_ALL_SITES_PAGES, totalPageCount ) : totalPageCount;

	return {
		siteId,
		posts: getSitePostsForQueryIgnoringPage( state, siteId, ownProps.query ),
		isRequestingPosts: isRequestingSitePostsForQueryIgnoringPage( state, siteId, ownProps.query ),
		totalPostCount: getSitePostsFoundForQuery( state, siteId, ownProps.query ),
		totalPageCount,
		lastPageToRequest,
	};
} )( PostTypeList );
