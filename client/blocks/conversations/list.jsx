/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { map } from 'lodash';

/***
 * Internal dependencies
 */
import PostComment from 'blocks/comments/post-comment';
import { getPostCommentsTree } from 'state/comments/selectors';
import ConversationCaterpillar from 'blocks/conversation-caterpillar';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import PostCommentForm from 'blocks/comments/form';

export class ConversationCommentList extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired, // required by PostComment
		commentIds: PropTypes.array.isRequired,
	};

	static defaultProps = {
		showCaterpillar: false,
	};

	state = {
		activeReplyCommentId: null,
		activeEditCommentId: null,
	};

	resetActiveReplyComment = () => this.setState( { activeReplyCommentId: null } );
	onEditCommentClick = commentId => this.setState( { activeEditCommentId: commentId } );
	onEditCommentCancel = () => this.setState( { activeEditCommentId: null } );
	onUpdateCommentText = commentText => this.setState( { commentText: commentText } );

	onReplyClick = commentId => {
		this.setState( { activeReplyCommentId: commentId } );
		recordAction( 'comment_reply_click' );
		recordGaEvent( 'Clicked Reply to Comment' );
		recordTrack( 'calypso_reader_comment_reply_click', {
			blog_id: this.props.post.site_ID,
			comment_id: commentId,
		} );
	};

	onReplyCancel = () => {
		recordAction( 'comment_reply_cancel_click' );
		recordGaEvent( 'Clicked Cancel Reply to Comment' );
		recordTrack( 'calypso_reader_comment_reply_cancel_click', {
			blog_id: this.props.post.site_ID,
			comment_id: this.state.activeReplyCommentId,
		} );
		this.resetActiveReplyComment();
	};

	render() {
		const { commentIds, commentsTree, post, showCaterpillar } = this.props;
		if ( ! commentIds ) {
			return null;
		}

		return (
			<div className="conversations__comment-list">
				<ul className="conversations__comment-list-ul">
					{ map( commentIds, commentId => {
						return (
							<PostComment
								showNestingReplyArrow
								commentsTree={ commentsTree }
								key={ commentId }
								commentId={ commentId }
								maxChildrenToShow={ 0 }
								maxDepth={ 2 }
								post={ post }
								onReplyClick={ this.onReplyClick }
								onReplyCancel={ this.onReplyCancel }
								activeReplyCommentId={ this.state.activeReplyCommentId }
								onEditCommentClick={ this.onEditCommentClick }
								onEditCommentCancel={ this.onEditCommentCancel }
								activeEditCommentId={ this.state.activeEditCommentId }
								onUpdateCommentText={ this.onUpdateCommentText }
								onCommentSubmit={ this.resetActiveReplyComment }
								commentText={ this.state.commentText }
							/>
						);
					} ) }
					{ ! this.state.activeReplyCommentId &&
						<PostCommentForm
							ref="postCommentForm"
							post={ post }
							parentCommentId={ null }
							commentText={ this.state.commentText }
							onUpdateCommentText={ this.onUpdateCommentText }
						/> }
				</ul>
				{ showCaterpillar &&
					<ConversationCaterpillar blogId={ post.site_ID } postId={ post.ID } /> }
			</div>
		);
	}
}

const ConnectedConversationCommentList = connect( ( state, ownProps ) => {
	const { site_ID: siteId, ID: postId } = ownProps.post;

	return {
		commentsTree: getPostCommentsTree( state, siteId, postId, 'all' ),
	};
} )( ConversationCommentList );

export default ConnectedConversationCommentList;
