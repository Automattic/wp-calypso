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
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import { changeCommentStatus, likeComment, unlikeComment } from 'state/comments/actions';
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
		removeFromPersisted: PropTypes.func,
		updatePersisted: PropTypes.func,
	};

	hasAction = action => includes( commentActions[ this.props.commentStatus ], action );

	setSpam = () => {
		const { commentId, removeFromPersisted } = this.props;

		this.setStatus( 'spam' );

		removeFromPersisted( commentId );
	};

	setStatus = status => {
		const {
			changeStatus,
			commentId,
			commentIsLiked,
			commentStatus,
			postId,
			siteId,
			unlike,
		} = this.props;

		const alsoUnlike = commentIsLiked && 'approved' !== status;

		changeStatus( siteId, postId, commentId, status, {
			alsoUnlike,
			previousStatus: commentStatus,
		} );

		if ( alsoUnlike ) {
			unlike( siteId, postId, commentId );
		}
	};

	setTrash = () => {
		const { commentId, removeFromPersisted } = this.props;

		this.setStatus( 'trash' );

		removeFromPersisted( commentId );
	};

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

	render() {
		const {
			commentIsApproved,
			commentIsLiked,
			commentIsPending,
			isExpanded,
			translate,
		} = this.props;

		if ( ! isExpanded && ! commentIsPending ) {
			return null;
		}

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
		commentIsPending: 'unapproved' === commentStatus,
		commentStatus,
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
