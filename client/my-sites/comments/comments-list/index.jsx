/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import CommentDetail from 'blocks/comment-detail';
import CommentDetailPlaceholder from 'blocks/comment-detail/comment-detail-placeholder';
import EmptyContent from 'components/empty-content';

export class CommentsList extends Component {
	static propTypes = {
		changeCommentStatus: PropTypes.func,
		comments: PropTypes.array,
		deleteComment: PropTypes.func,
		editComment: PropTypes.func,
		emptyMessageLine: PropTypes.string,
		emptyMessageTitle: PropTypes.string,
		isCommentSelected: PropTypes.func,
		isJetpack: PropTypes.bool,
		isBulkEdit: PropTypes.bool,
		likeComment: PropTypes.func,
		replyComment: PropTypes.func,
		setBulkStatus: PropTypes.func,
		showEmptyContent: PropTypes.bool,
		showPlaceholder: PropTypes.bool,
		siteBlacklist: PropTypes.string,
		siteId: PropTypes.number,
		status: PropTypes.string,
		translate: PropTypes.func,
		undoBulkStatus: PropTypes.func,
		unlikeComment: PropTypes.func,
		hasCommentJustMovedBackToCurrentStatus: PropTypes.func,
	};

	render() {
		const {
			comments,
			deleteCommentPermanently,
			editComment,
			emptyMessageLine,
			emptyMessageTitle,
			replyComment,
			setCommentStatus,
			showEmptyContent,
			showPlaceholder,
			siteId,
			siteBlacklist,
			toggleCommentLike,
			toggleCommentSelected,
			isCommentSelected,
			isJetpack,
			isBulkEdit,
			hasCommentJustMovedBackToCurrentStatus,
		} = this.props;
		return (
			<div className="comments-list">
				<ReactCSSTransitionGroup
					className="comments-list__transition-wrapper"
					transitionEnterTimeout={ 150 }
					transitionLeaveTimeout={ 150 }
					transitionName="comment-list__transition"
				>
					{ map( comments, commentId => (
						<CommentDetail
							commentId={ commentId }
							commentIsSelected={ isCommentSelected( commentId ) }
							deleteCommentPermanently={ deleteCommentPermanently }
							editComment={ editComment }
							isBulkEdit={ isBulkEdit }
							key={ `comment-${ siteId }-${ commentId }` }
							refreshCommentData={
								! isJetpack && ! hasCommentJustMovedBackToCurrentStatus( commentId )
							}
							replyComment={ replyComment }
							setCommentStatus={ setCommentStatus }
							siteBlacklist={ siteBlacklist }
							siteId={ siteId }
							toggleCommentLike={ toggleCommentLike }
							toggleCommentSelected={ toggleCommentSelected }
						/>
					) ) }

					{ showPlaceholder && <CommentDetailPlaceholder key="comment-detail-placeholder" /> }

					{ showEmptyContent && (
						<EmptyContent
							illustration="/calypso/images/comments/illustration_comments_gray.svg"
							illustrationWidth={ 150 }
							key="comment-list-empty"
							line={ emptyMessageLine }
							title={ emptyMessageTitle }
						/>
					) }
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}

export default localize( CommentsList );
