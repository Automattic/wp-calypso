/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { filter, map, sortBy, take } from 'lodash';

/**
 * Internal dependencies
 */
import CommentListHeader from 'my-sites/comments/comment-list/comment-list-header';
import CommentNavigation from 'my-sites/comments/comment-navigation';
import Notice from 'components/notice';
import QuerySiteCommentsTree from 'components/data/query-site-comments-tree';
import ThreadedComment from 'my-sites/comments/comment-threaded-list/threaded-comment';
import { getSiteCommentsTree, isCommentsTreeInitialized } from 'state/selectors';

export class CommentThreadedList extends Component {
	static propTypes = {
		postId: PropTypes.number,
		siteFragment: PropTypes.string,
		siteId: PropTypes.number,
	};

	state = {
		commentsPerPage: 10,
		pageLoaded: 1,
	};

	getRootComments = () => filter( this.props.commentsTree, { commentParentId: 0 } );

	loadMoreComments = () =>
		this.setState( ( { pageLoaded } ) => ( { pageLoaded: pageLoaded + 1 } ) );

	renderLoadMore = () => {
		const { translate } = this.props;
		const { commentsPerPage, pageLoaded } = this.state;
		const rootTotal = this.getRootComments().length;
		const loaded = commentsPerPage * pageLoaded;

		return (
			<div>
				{ rootTotal >= loaded && (
					<Notice
						className="comment-threaded-list__more-comments"
						icon="chevron-down"
						showDismiss={ false }
					>
						<a onClick={ this.loadMoreComments }>{ translate( 'Load more comments' ) }</a>
					</Notice>
				) }
			</div>
		);
	};

	render() {
		const { commentsTree, isLoading, postId, siteFragment, siteId } = this.props;
		const { commentsPerPage, pageLoaded } = this.state;

		return (
			<div className="comment-threaded-list">
				<QuerySiteCommentsTree siteId={ siteId } status="all" />

				<CommentListHeader postId={ postId } />

				<CommentNavigation
					commentsPage={ [] }
					postId={ postId }
					selectedCount={ 0 }
					siteId={ siteId }
					siteFragment={ siteFragment }
					status="all"
				/>

				{ ! isLoading &&
					map( take( this.getRootComments(), commentsPerPage * pageLoaded ), ( { commentId } ) => (
						<ThreadedComment
							commentId={ commentId }
							commentsTree={ commentsTree }
							depth={ 0 }
							key={ commentId }
							siteId={ siteId }
						/>
					) ) }

				{ this.renderLoadMore() }
			</div>
		);
	}
}

const mapStateToProps = ( state, { postId, siteId } ) => {
	const siteCommentsTree = getSiteCommentsTree( state, siteId, 'all' );
	const commentsTree = sortBy( filter( siteCommentsTree, { postId } ), 'commentId' );

	const isLoading = ! isCommentsTreeInitialized( state, siteId, 'all' );
	return {
		commentsTree,
		isLoading,
	};
};

export default connect( mapStateToProps )( localize( CommentThreadedList ) );
