/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { map, zipObject, fill, size } from 'lodash';

/***
 * Internal dependencies
 */
import PostComment from 'blocks/comments/post-comment';
import { POST_COMMENT_DISPLAY_TYPES } from 'state/comments/constants';
import {
	commentsFetchingStatus,
	getPostCommentsTree,
	getExpansionsForPost,
	getHiddenCommentsForPost,
} from 'state/comments/selectors';
import ConversationCaterpillar from 'blocks/conversation-caterpillar';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import PostCommentForm from 'blocks/comments/form';
import { requestPostComments } from 'state/comments/actions';

export class ConversationCommentList extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired, // required by PostComment
		commentIds: PropTypes.array.isRequired,
	};

	static defaultProps = {
		enableCaterpillar: true,
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

	reqMoreComments = ( props = this.props ) => {
		const { siteId, postId, enableCaterpillar } = props;

		const { haveEarlierCommentsToFetch, haveLaterCommentsToFetch } = props.commentsFetchingStatus;

		if ( enableCaterpillar && ( haveEarlierCommentsToFetch || haveLaterCommentsToFetch ) ) {
			props.requestPostComments( { siteId, postId } );
		}
	};

	componentDidMount() {
		this.reqMoreComments();
	}

	render() {
		const { commentIds, commentsTree, post, expansions, enableCaterpillar } = this.props;
		const startingExpanded = zipObject(
			commentIds,
			fill( Array( commentIds.length ), POST_COMMENT_DISPLAY_TYPES.excerpt )
		);
		const commentsToShow = { ...startingExpanded, ...expansions };
		const showCaterpillar =
			enableCaterpillar && size( commentsToShow ) < post.discussion.comment_count;

		return (
			<div className="conversations__comment-list">
				<ul className="conversations__comment-list-ul">
					{ showCaterpillar &&
						<ConversationCaterpillar blogId={ post.site_ID } postId={ post.ID } /> }
					{ map( commentsTree.children, commentId => {
						return (
							<PostComment
								showNestingReplyArrow
								enableCaterpillar={ enableCaterpillar }
								post={ post }
								commentsTree={ commentsTree }
								key={ commentId }
								commentId={ commentId }
								maxDepth={ 2 }
								commentsToShow={ commentsToShow }
								onReplyClick={ this.onReplyClick }
								onReplyCancel={ this.onReplyCancel }
								activeReplyCommentId={ this.state.activeReplyCommentId }
								onEditCommentClick={ this.onEditCommentClick }
								onEditCommentCancel={ this.onEditCommentCancel }
								activeEditCommentId={ this.state.activeEditCommentId }
								onUpdateCommentText={ this.onUpdateCommentText }
								onCommentSubmit={ this.resetActiveReplyComment }
								commentText={ this.state.commentText }
								showReadMoreInActions={ true }
								displayType={ POST_COMMENT_DISPLAY_TYPES.excerpt }
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
			</div>
		);
	}
}

const ConnectedConversationCommentList = connect(
	( state, ownProps ) => {
		const { site_ID: siteId, ID: postId, discussion } = ownProps.post;

		return {
			siteId,
			postId,
			commentsTree: getPostCommentsTree( state, siteId, postId, 'all' ),
			commentsFetchingStatus:
				commentsFetchingStatus( state, siteId, postId, discussion.comment_count ) || {},
			expansions: getExpansionsForPost( state, siteId, postId ),
			hiddenComments: getHiddenCommentsForPost( state, siteId, postId ),
		};
	},
	{ requestPostComments }
)( ConversationCommentList );

export default ConnectedConversationCommentList;
