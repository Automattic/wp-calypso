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
import { get, includes, isEmpty } from 'lodash';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CommentConfirmation from 'my-sites/comments/comment/comment-confirmation';
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
		isExpanded: PropTypes.bool,
		isPersistent: PropTypes.bool,
		removeFromPersisted: PropTypes.func,
		toggleExpanded: PropTypes.func,
		updatePersisted: PropTypes.func,
	};

	state = {
		previousCommentData: {},
	};

	delete = () => {
		const { deletePermanently, commentId, postId, removeFromPersisted, siteId } = this.props;

		deletePermanently( siteId, postId, commentId );

		removeFromPersisted( commentId );
	};

	deletePreviousCommentData = () => this.setState( { previousCommentData: {} } );

	hasAction = action => includes( commentActions[ this.props.commentStatus ], action );

	setSpam = () => {
		const { commentId, isExpanded, toggleExpanded, updatePersisted } = this.props;

		if ( isExpanded ) {
			toggleExpanded();
		}

		this.setStatus( 'spam' );

		this.storePreviousCommentData();
		updatePersisted( commentId );
	};

	setStatus = ( status, options = { isUndo: false } ) => {
		const {
			changeStatus,
			commentId,
			commentIsLiked,
			commentStatus,
			postId,
			siteId,
			unlike,
		} = this.props;
		const { isUndo } = options;

		const alsoUnlike = commentIsLiked && 'approved' !== status;

		changeStatus( siteId, postId, commentId, status, {
			alsoUnlike,
			isUndo,
			previousStatus: commentStatus,
		} );

		if ( alsoUnlike ) {
			unlike( siteId, postId, commentId );
		}
	};

	setTrash = () => {
		const { commentId, isExpanded, toggleExpanded, updatePersisted } = this.props;

		if ( isExpanded ) {
			toggleExpanded();
		}

		this.setStatus( 'trash' );

		this.storePreviousCommentData();
		updatePersisted( commentId );
	};

	storePreviousCommentData = () =>
		this.setState( { previousCommentData: this.props.minimumComment } );

	toggleApproved = () => {
		const { commentId, commentIsApproved, commentStatus, updatePersisted } = this.props;

		this.setStatus( commentIsApproved ? 'unapproved' : 'approved' );

		if ( includes( [ 'approved', 'unapproved' ], commentStatus ) ) {
			updatePersisted( commentId );
		}
	};

	toggleLike = () => {
		const {
			commentId,
			commentIsLiked,
			commentStatus,
			like,
			postId,
			siteId,
			unlike,
			updatePersisted,
		} = this.props;

		if ( commentIsLiked ) {
			return unlike( siteId, postId, commentId );
		}

		const alsoApprove = 'unapproved' === commentStatus;

		like( siteId, postId, commentId, { alsoApprove } );

		if ( alsoApprove ) {
			this.setStatus( 'approved' );
			updatePersisted( commentId );
		}
	};

	undo = () => {
		const { previousCommentData } = this.state;
		if ( isEmpty( previousCommentData ) ) {
			return;
		}

		const { commentId, like, postId, removeFromPersisted, siteId } = this.props;
		const { isLiked, status } = previousCommentData;

		this.setStatus( status, { isUndo: true } );

		if ( isLiked ) {
			like( siteId, postId, commentId, { alsoApprove: 'approved' === status } );
		}

		this.deletePreviousCommentData();
		removeFromPersisted( commentId );
	};

	render() {
		const {
			commentId,
			commentIsApproved,
			commentIsLiked,
			commentStatus,
			isPersistent,
			translate,
		} = this.props;

		return (
			<div>
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
				</div>

				<ReactCSSTransitionGroup
					className="comment__confirmation-transition"
					transitionEnterTimeout={ 150 }
					transitionLeaveTimeout={ 150 }
					transitionName="comment__confirmation-transition"
				>
					{ isPersistent &&
					! includes( [ 'approved', 'unapproved' ], commentStatus ) && (
						<CommentConfirmation
							{ ...{ commentId } }
							key="comment__confirmation"
							undo={ this.undo }
						/>
					) }
				</ReactCSSTransitionGroup>
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
