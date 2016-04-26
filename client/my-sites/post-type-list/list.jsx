/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import InfiniteList from 'components/infinite-list';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isRequestingSitePostsForQuery,
	isSitePostsLastPageForQuery,
	getSitePostsForQueryIgnoringPage
} from 'state/posts/selectors';
import PostTypeListPost from './post';
import PostTypeListPostPlaceholder from './post-placeholder';
import PostTypeListEmptyContent from './empty-content';

/**
 * Constants
 */
const GUESSED_POST_HEIGHT = 86;

class PostTypeListList extends Component {
	getListKey() {
		const { siteId, query } = this.props;
		return [ siteId, JSON.stringify( omit( query, 'page' ) ) ].join();
	}

	getPostItemRef( post ) {
		return post.global_ID;
	}

	renderPostItem( post ) {
		return (
			<PostTypeListPost
				key={ post.global_ID }
				globalId={ post.global_ID } />
		);
	}

	renderLoadingPlaceholder() {
		return (
			<PostTypeListPostPlaceholder key="placeholder" />
		);
	}

	render() {
		const { query, posts, lastPage, requesting, requestNextPage } = this.props;

		return (
			<div className="post-type-list__list">
				{ posts && ! posts.length && ! requesting && (
					<PostTypeListEmptyContent
						type={ query.type }
						status={ query.status } />
				) }
				<InfiniteList
					key={ this.getListKey() }
					items={ posts || [] }
					lastPage={ !! lastPage }
					fetchingNextPage={ requesting }
					guessedItemHeight={ GUESSED_POST_HEIGHT }
					fetchNextPage={ requestNextPage }
					getItemRef={ this.getPostItemRef }
					renderItem={ this.renderPostItem }
					renderLoadingPlaceholders={ this.renderLoadingPlaceholder }
					className="post-type-list__posts" />
			</div>
		);
	}
}

PostTypeListList.propTypes = {
	query: PropTypes.object,
	siteId: PropTypes.number,
	posts: PropTypes.array,
	lastPage: PropTypes.bool,
	requesting: PropTypes.bool,
	requestNextPage: PropTypes.func
};

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		posts: getSitePostsForQueryIgnoringPage( state, siteId, ownProps.query ),
		lastPage: isSitePostsLastPageForQuery( state, siteId, ownProps.query ),
		requesting: isRequestingSitePostsForQuery( state, siteId, ownProps.query )
	};
} )( PostTypeListList );
