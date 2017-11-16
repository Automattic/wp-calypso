/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import EmptyContent from 'components/empty-content';
import DocumentHead from 'components/data/document-head';
import ModerateComment from 'components/data/moderate-comment';
import Comment from 'my-sites/comments/comment';
import CommentPermalink from 'my-sites/comment/comment-permalink';
import CommentDeleteWarning from 'my-sites/comment/comment-delete-warning';
import CommentListHeader from 'my-sites/comments/comment-list/comment-list-header';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { preventWidows } from 'lib/formatting';
import { getSiteComment, canCurrentUser } from 'state/selectors';
import getSiteId from 'state/selectors/get-site-id';

export class CommentView extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		commentId: PropTypes.number.isRequired,
		action: PropTypes.string,
		canModerateComments: PropTypes.bool.isRequired,
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
			redirectToPostView,
			translate,
		} = this.props;

		return (
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<Main className="comments" wideLayout>
				<PageViewTracker path="/comment/:site" title="Comments" />
				<DocumentHead title={ translate( 'Comment' ) } />
				{ canModerateComments && (
					<ModerateComment
						{ ...{ siteId, postId, commentId, newStatus: action, redirectToPostView } }
					/>
				) }
				{ 'delete' === action && (
					<CommentDeleteWarning { ...{ siteId, postId, commentId, redirectToPostView } } />
				) }
				<CommentListHeader { ...{ postId } } />
				{ ! canModerateComments && (
					<EmptyContent
						title={ preventWidows(
							translate( "Oops! You don't have permission to manage comments." )
						) }
						line={ preventWidows(
							translate( "If you think you should, contact this site's administrator." )
						) }
						illustration="/calypso/images/illustrations/illustration-500.svg"
					/>
				) }
				{ canModerateComments && (
					<Comment
						commentId={ commentId }
						refreshCommentData={ true }
						redirect={ redirectToPostView }
					/>
				) }
				{ canModerateComments && <CommentPermalink { ...{ siteId, commentId } } /> }
			</Main>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const { commentId, redirectToPostView, siteFragment } = ownProps;

	const siteId = getSiteId( state, siteFragment );
	const comment = getSiteComment( state, siteId, commentId );
	const postId = get( comment, 'post.ID' );

	const canModerateComments = canCurrentUser( state, siteId, 'moderate_comments' ) !== false;

	return {
		siteId,
		postId,
		canModerateComments,
		redirectToPostView: redirectToPostView( postId ),
	};
};

export default connect( mapStateToProps )( localize( CommentView ) );
