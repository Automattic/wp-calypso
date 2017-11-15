/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import classNames from 'classnames';
import { get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { getMinimumComment } from 'my-sites/comments/comment/utils';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import {
	changeCommentStatus,
	deleteComment,
	likeComment,
	unlikeComment,
} from 'state/comments/actions';
import { removeNotice, successNotice } from 'state/notices/actions';
import { getSiteComment } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const commentActions = {
	unapproved: [ 'like', 'approve', 'edit', 'reply', 'spam', 'trash' ],
	approved: [ 'like', 'approve', 'edit', 'reply', 'spam', 'trash' ],
	spam: [ 'approve', 'delete' ],
	trash: [ 'approve', 'spam', 'delete' ],
};

export class CommentActions extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		toggleEditMode: PropTypes.func,
		toggleReply: PropTypes.func,
		updateLastUndo: PropTypes.func,
	};

	delete = () => {
		const { deletePermanently, commentId, postId, siteId } = this.props;
		deletePermanently( siteId, postId, commentId );
	};

	hasAction = action => includes( commentActions[ this.props.commentStatus ], action );

	setSpam = () => this.setStatus( 'spam' );

	setStatus = status => {
		const {
			changeStatus,
			commentId,
			commentIsLiked,
			commentStatus,
			postId,
			siteId,
			unlike,
			updateLastUndo,
		} = this.props;

		const alsoUnlike = commentIsLiked && 'approved' !== status;

		updateLastUndo( null );

		changeStatus( siteId, postId, commentId, status, {
			alsoUnlike,
			previousStatus: commentStatus,
		} );

		if ( alsoUnlike ) {
			unlike( siteId, postId, commentId );
		}

		this.showNotice( status );
	};

	setTrash = () => this.setStatus( 'trash' );

	showNotice = status => {
		const { minimumComment, translate } = this.props;

		this.props.removeNotice( 'comment-notice' );

		const message = get(
			{
				approved: translate( 'Comment approved.' ),
				unapproved: translate( 'Comment unapproved.' ),
				spam: translate( 'Comment marked as spam.' ),
				trash: translate( 'Comment moved to trash.' ),
			},
			status
		);

		const noticeOptions = {
			button: translate( 'Undo' ),
			id: 'comment-notice',
			isPersistent: true,
			onClick: this.undo( status, minimumComment ),
		};

		this.props.successNotice( message, noticeOptions );
	};

	undo = ( status, previousCommentData ) => () => {
		const { changeStatus, commentId, like, postId, siteId, unlike, updateLastUndo } = this.props;
		const { isLiked: wasLiked, status: previousStatus } = previousCommentData;
		const alsoApprove = 'approved' !== status && 'approved' === previousStatus;
		const alsoUnlike = ! wasLiked && 'approved' !== previousStatus;

		updateLastUndo( commentId );

		changeStatus( siteId, postId, commentId, previousStatus, {
			alsoUnlike,
			isUndo: true,
			previousStatus: status,
		} );

		if ( wasLiked ) {
			like( siteId, postId, commentId, { alsoApprove } );
		} else if ( alsoUnlike ) {
			unlike( siteId, postId, commentId );
		}

		this.props.removeNotice( 'comment-notice' );
	};

	toggleApproved = () => this.setStatus( this.props.commentIsApproved ? 'unapproved' : 'approved' );

	toggleLike = () => {
		const { commentId, commentIsLiked, commentStatus, like, postId, siteId, unlike } = this.props;

		if ( commentIsLiked ) {
			return unlike( siteId, postId, commentId );
		}

		const alsoApprove = 'unapproved' === commentStatus;

		like( siteId, postId, commentId, { alsoApprove } );

		if ( alsoApprove ) {
			this.setStatus( 'approved' );
		}
	};

	render() {
		const {
			commentIsApproved,
			commentIsLiked,
			toggleEditMode,
			toggleReply,
			translate,
		} = this.props;

		return (
			<div className="comment__actions">
				{ this.hasAction( 'approve' ) && (
					<Button
						borderless
						className={ classNames( 'comment__action comment__action-approve', {
							'is-approved': commentIsApproved,
						} ) }
						onClick={ this.toggleApproved }
					>
						<Gridicon icon={ commentIsApproved ? 'checkmark-circle' : 'checkmark' } />
						<span>{ commentIsApproved ? translate( 'Approved' ) : translate( 'Approve' ) }</span>
					</Button>
				) }

				{ this.hasAction( 'spam' ) && (
					<Button
						borderless
						className="comment__action comment__action-spam"
						onClick={ this.setSpam }
					>
						<Gridicon icon="spam" />
						<span>{ translate( 'Spam' ) }</span>
					</Button>
				) }

				{ this.hasAction( 'trash' ) && (
					<Button
						borderless
						className="comment__action comment__action-trash"
						onClick={ this.setTrash }
					>
						<Gridicon icon="trash" />
						<span>{ translate( 'Trash' ) }</span>
					</Button>
				) }

				{ this.hasAction( 'delete' ) && (
					<Button
						borderless
						className="comment__action comment__action-delete"
						onClick={ this.delete }
					>
						<Gridicon icon="trash" />
						<span>{ translate( 'Delete Permanently' ) }</span>
					</Button>
				) }

				{ this.hasAction( 'like' ) && (
					<Button
						borderless
						className={ classNames( 'comment__action comment__action-like', {
							'is-liked': commentIsLiked,
						} ) }
						onClick={ this.toggleLike }
					>
						<Gridicon icon={ commentIsLiked ? 'star' : 'star-outline' } />
						<span>{ commentIsLiked ? translate( 'Liked' ) : translate( 'Like' ) }</span>
					</Button>
				) }

				{ this.hasAction( 'edit' ) && (
					<Button
						borderless
						className="comment__action comment__action-pencil"
						onClick={ toggleEditMode }
					>
						<Gridicon icon="pencil" />
						<span>{ translate( 'Edit' ) }</span>
					</Button>
				) }

				{ this.hasAction( 'reply' ) && (
					<Button
						borderless
						className="comment__action comment__action-reply"
						onClick={ toggleReply }
					>
						<Gridicon icon="reply" />
						<span>{ translate( 'Reply' ) }</span>
					</Button>
				) }
			</div>
		);
	}
}

const mapStateToProps = ( state, { commentId } ) => {
	const siteId = getSelectedSiteId( state );
	const comment = getSiteComment( state, siteId, commentId );
	const commentStatus = get( comment, 'status' );

	return {
		commentIsApproved: 'approved' === commentStatus,
		commentIsLiked: get( comment, 'i_like' ),
		commentStatus,
		minimumComment: getMinimumComment( comment ),
		postId: get( comment, 'post.ID' ),
		siteId,
	};
};

const mapDispatchToProps = dispatch => ( {
	changeStatus: (
		siteId,
		postId,
		commentId,
		status,
		analytics = { alsoUnlike: false, isUndo: false }
	) =>
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_comment_management_change_status', {
						also_unlike: analytics.alsoUnlike,
						is_undo: analytics.isUndo,
						previous_status: analytics.previousStatus,
						status,
					} ),
					bumpStat( 'calypso_comment_management', 'comment_status_changed_to_' + status )
				),
				changeCommentStatus( siteId, postId, commentId, status )
			)
		),
	deletePermanently: ( siteId, postId, commentId ) =>
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_comment_management_delete' ),
					bumpStat( 'calypso_comment_management', 'comment_deleted' )
				),
				deleteComment( siteId, postId, commentId, { showSuccessNotice: true } )
			)
		),
	like: ( siteId, postId, commentId, analytics = { alsoApprove: false } ) =>
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_comment_management_like', {
						also_approve: analytics.alsoApprove,
					} ),
					bumpStat( 'calypso_comment_management', 'comment_liked' )
				),
				likeComment( siteId, postId, commentId )
			)
		),
	removeNotice: noticeId => dispatch( removeNotice( noticeId ) ),
	successNotice: ( text, options ) => dispatch( successNotice( text, options ) ),
	unlike: ( siteId, postId, commentId ) =>
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_comment_management_unlike' ),
					bumpStat( 'calypso_comment_management', 'comment_unliked' )
				),
				unlikeComment( siteId, postId, commentId )
			)
		),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentActions ) );
