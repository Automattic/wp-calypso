import { localize, fixMe } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import ModerateComment from 'calypso/components/data/moderate-comment';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { preventWidows } from 'calypso/lib/formatting';
import CommentDeleteWarning from 'calypso/my-sites/comment/comment-delete-warning';
import CommentPermalink from 'calypso/my-sites/comment/comment-permalink';
import Comment from 'calypso/my-sites/comments/comment';
import CommentListHeader from 'calypso/my-sites/comments/comment-list/comment-list-header';
import { getSiteComment } from 'calypso/state/comments/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSiteId } from 'calypso/state/sites/selectors';

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

	state = {
		isEditMode: this.props.action === 'edit',
	};

	toggleEditMode = () => {
		this.setState( ( { isEditMode } ) => ( { isEditMode: ! isEditMode } ) );
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

		const { isEditMode } = this.state;

		return (
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<Main className="comments" wideLayout>
				<PageViewTracker path="/comment/:site/:commentId" title="Comments" />
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
							fixMe( {
								text: "You don't have permission to manage comments.",
								newCopy: translate( "You don't have permission to manage comments." ),
								oldCopy: translate( "Oops! You don't have permission to manage comments." ),
							} )
						) }
						line={ preventWidows(
							translate( "If you think you should, contact this site's administrator." )
						) }
					/>
				) }
				{ canModerateComments && (
					<Comment
						commentId={ commentId }
						refreshCommentData
						redirect={ redirectToPostView }
						isPostView
						isSingularEditMode={ canModerateComments && isEditMode }
						onToggleEditMode={ this.toggleEditMode }
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
	const hasPermalink = [ 'approved', 'unapproved' ].includes( get( comment, 'status' ) );

	return {
		siteId,
		postId,
		canModerateComments,
		hasPermalink,
		redirectToPostView: redirectToPostView( postId ),
	};
};

export default connect( mapStateToProps )( localize( CommentView ) );
