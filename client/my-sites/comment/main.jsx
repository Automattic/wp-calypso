/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import EmptyContent from 'calypso/components/empty-content';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteCommentsTree from 'calypso/components/data/query-site-comments-tree';
import ModerateComment from 'calypso/components/data/moderate-comment';
import Comment from 'calypso/my-sites/comments/comment';
import CommentPermalink from 'calypso/my-sites/comment/comment-permalink';
import CommentDeleteWarning from 'calypso/my-sites/comment/comment-delete-warning';
import CommentListHeader from 'calypso/my-sites/comments/comment-list/comment-list-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { preventWidows } from 'calypso/lib/formatting';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import { getSiteComment } from 'calypso/state/comments/selectors';
import getSiteId from 'calypso/state/selectors/get-site-id';

/**
 * Style dependencies
 */
import './style.scss';

export class CommentView extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		commentId: PropTypes.number.isRequired,
		action: PropTypes.string,
		canModerateComments: PropTypes.bool.isRequired,
		hasPermalink: PropTypes.bool,
		redirectToPostView: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const {
			siteId,
			postId,
			commentId,
			action,
			canModerateComments,
			hasPermalink,
			redirectToPostView,
			translate,
		} = this.props;

		return (
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<Main className="comments" wideLayout>
				<PageViewTracker path="/comment/:site/:commentId" title="Comments" />
				<QuerySiteCommentsTree siteId={ siteId } status={ 'all' } />
				<DocumentHead title={ translate( 'Comment' ) } />
				{ canModerateComments && (
					<ModerateComment
						{ ...{ siteId, postId, commentId, newStatus: action, redirectToPostView } }
					/>
				) }
				{ 'delete' === action && (
					<CommentDeleteWarning { ...{ siteId, postId, commentId, redirectToPostView } } />
				) }
				<CommentListHeader { ...{ postId, commentId } } />
				{ ! canModerateComments && (
					<EmptyContent
						title={ preventWidows(
							translate( "Oops! You don't have permission to manage comments." )
						) }
						line={ preventWidows(
							translate( "If you think you should, contact this site's administrator." )
						) }
						illustration="/calypso/images/illustrations/error.svg"
					/>
				) }
				{ canModerateComments && (
					<Comment
						commentId={ commentId }
						refreshCommentData={ true }
						redirect={ redirectToPostView }
						isPostView={ true }
						isEditMode={ canModerateComments && 'edit' === action }
					/>
				) }
				{ canModerateComments && hasPermalink && <CommentPermalink { ...{ siteId, commentId } } /> }
			</Main>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const { commentId, redirectToPostView, siteFragment } = ownProps;

	const siteId = getSiteId( state, siteFragment );
	const comment = getSiteComment( state, siteId, commentId );
	const postId = get( comment, 'post.ID' );

	const canModerateComments = canCurrentUser( state, siteId, 'moderate_comments' );
	const hasPermalink = includes( [ 'approved', 'unapproved' ], get( comment, 'status' ) );

	return {
		siteId,
		postId,
		canModerateComments,
		hasPermalink,
		redirectToPostView: redirectToPostView( postId ),
	};
};

export default connect( mapStateToProps )( localize( CommentView ) );
