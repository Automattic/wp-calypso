/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import classNames from 'classnames';
import { get, includes, isEqual, isUndefined, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import scrollTo from 'lib/scroll-to';
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
import { getSiteComment } from 'state/comments/selectors';

const commentActions = {
	unapproved: [ 'like', 'approve', 'edit', 'reply', 'spam', 'trash' ],
	approved: [ 'like', 'approve', 'edit', 'reply', 'spam', 'trash' ],
	spam: [ 'approve', 'delete' ],
	trash: [ 'approve', 'spam', 'delete' ],
};

export class CommentActions extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		commentId: PropTypes.number,
		canModerateComment: PropTypes.bool,
		commentsListQuery: PropTypes.object,
		getCommentOffsetTop: PropTypes.func,
		redirect: PropTypes.func,
		toggleEditMode: PropTypes.func,
		toggleReply: PropTypes.func,
		updateLastUndo: PropTypes.func,
	};

	static defaultProps = {
		updateLastUndo: noop,
	};

	shouldComponentUpdate = ( nextProps ) => ! isEqual( this.props, nextProps );

	delete = () => {
		if (
			isUndefined( window ) ||
			window.confirm( this.props.translate( 'Delete this comment permanently?' ) )
		) {
			this.props.deletePermanently();
		}
	};

	hasAction = ( action ) => includes( commentActions[ this.props.commentStatus ], action );

	setSpam = () => this.setStatus( 'spam' );

	setStatus = ( status ) => {
		const { changeStatus, commentIsLiked, commentStatus, unlike, updateLastUndo } = this.props;

		const alsoUnlike = commentIsLiked && 'approved' !== status;

		updateLastUndo( null );

		changeStatus( status, {
			alsoUnlike,
			previousStatus: commentStatus,
		} );

		if ( alsoUnlike ) {
			unlike();
		}

		this.showNotice( status );
	};

	setTrash = () => this.setStatus( 'trash' );

	showNotice = ( status ) => {
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
		const { changeStatus, commentId, like, unlike, updateLastUndo } = this.props;
		const { isLiked: wasLiked, status: previousStatus } = previousCommentData;
		const alsoApprove = 'approved' !== status && 'approved' === previousStatus;
		const alsoUnlike = ! wasLiked && 'approved' !== previousStatus;

		updateLastUndo( commentId );

		changeStatus( previousStatus, {
			alsoUnlike,
			isUndo: true,
			previousStatus: status,
		} );

		if ( wasLiked ) {
			like( { alsoApprove } );
		} else if ( alsoUnlike ) {
			unlike();
		}

		this.props.removeNotice( 'comment-notice' );
	};

	toggleApproved = () => this.setStatus( this.props.commentIsApproved ? 'unapproved' : 'approved' );

	toggleEditMode = () => {
		this.props.toggleEditMode();
		scrollTo( { x: 0, y: this.props.getCommentOffsetTop() } );
	};

	toggleLike = () => {
		const { commentIsLiked, commentStatus, like, unlike } = this.props;

		if ( commentIsLiked ) {
			return unlike();
		}

		const alsoApprove = 'unapproved' === commentStatus;

		like( { alsoApprove } );

		if ( alsoApprove ) {
			this.setStatus( 'approved' );
		}
	};

	render() {
		const {
			canModerateComment,
			commentIsApproved,
			commentIsLiked,
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
						tabIndex="0"
						disabled={ ! canModerateComment }
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
						tabIndex="0"
						disabled={ ! canModerateComment }
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
						tabIndex="0"
						disabled={ ! canModerateComment }
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
						tabIndex="0"
						disabled={ ! canModerateComment }
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
						tabIndex="0"
						disabled={ ! canModerateComment && ! commentIsApproved }
					>
						<Gridicon icon={ commentIsLiked ? 'star' : 'star-outline' } />
						<span>{ commentIsLiked ? translate( 'Liked' ) : translate( 'Like' ) }</span>
					</Button>
				) }

				{ this.hasAction( 'edit' ) && (
					<Button
						borderless
						className="comment__action comment__action-pencil"
						onClick={ this.toggleEditMode }
						tabIndex="0"
						disabled={ ! canModerateComment }
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
						tabIndex="0"
						disabled={ ! canModerateComment && ! commentIsApproved }
					>
						<Gridicon icon="reply" />
						<span>{ translate( 'Reply' ) }</span>
					</Button>
				) }
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId, commentId } ) => {
	const comment = getSiteComment( state, siteId, commentId );
	const commentStatus = get( comment, 'status' );

	return {
		canModerateComment: get( comment, 'can_moderate', false ),
		commentIsApproved: 'approved' === commentStatus,
		commentIsLiked: get( comment, 'i_like' ),
		commentStatus,
		minimumComment: getMinimumComment( comment ),
	};
};

const mapDispatchToProps = ( dispatch, { siteId, postId, commentId, commentsListQuery } ) => ( {
	changeStatus: ( status, analytics = { alsoUnlike: false, isUndo: false } ) =>
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
				changeCommentStatus( siteId, postId, commentId, status, commentsListQuery )
			)
		),
	deletePermanently: () =>
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_comment_management_delete' ),
					bumpStat( 'calypso_comment_management', 'comment_deleted' )
				),
				deleteComment( siteId, postId, commentId, { showSuccessNotice: true }, commentsListQuery )
			)
		),
	like: ( analytics = { alsoApprove: false } ) =>
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
	removeNotice: ( noticeId ) => dispatch( removeNotice( noticeId ) ),
	successNotice: ( text, options ) => dispatch( successNotice( text, options ) ),
	unlike: () =>
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
