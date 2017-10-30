/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
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
	hasAction = action => includes( commentActions[ this.props.commentStatus ], action );

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
		const alsoUnlike = commentIsLiked && 'approved' !== commentStatus;

		changeStatus( siteId, postId, commentId, status, { alsoUnlike } );

		if ( alsoUnlike ) {
			unlike( siteId, postId, commentId );
		}
	};

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
		const { commentIsLiked, translate } = this.props;

		return (
			<div className="comment__actions">
				{ this.hasAction( 'like' ) && (
					<Button
						borderless
						className={ classNames( 'comment__action', { 'is-liked': commentIsLiked } ) }
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

	return {
		commentIsLiked: get( comment, 'i_like' ),
		commentStatus: get( comment, 'status' ),
		postId: get( comment, 'post.ID' ),
		siteId,
	};
};

const mapDispatchToProps = dispatch => ( {
	changeStatus: ( siteId, postId, commentId, status, analytics = { alsoUnlike: false } ) =>
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
