/** @format */
/**
 * External dependencies
 */
import { map, zipObject, fill, size } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PostCommentForm from 'blocks/comments/form';
import PostComment from 'blocks/comments/post-comment';
import ConversationCaterpillar from 'blocks/conversation-caterpillar';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import { requestPostComments } from 'state/comments/actions';
import { POST_COMMENT_DISPLAY_TYPES } from 'state/comments/constants';
import { commentsFetchingStatus, getPostCommentsTree, getExpansionsForPost, getHiddenCommentsForPost } from 'state/comments/selectors';

/**
 * ConversationsCommentList is the component that represents all of the comments for a conversations-stream
 * Some of it is boilerplate stolen from PostCommnentList (all the activeXCommentId bits) but the special
 * convos parts are related to:
 *  1. caterpillars
 *  2. commentsToShow
 *
 * As of the time of this writing, commentsToShow is constructing by merging two objects:
 *  1. expansion state in the reducer for the specific post
 *  2. commentIds handed from the api as seeds to start with as open. high watermark will replace this logic.
 *
 * So when a post is loaded, the api gives us 3 comments.  This component creates an object that looks like:
 *   { [commentId1]: 'is-excerpt', [commentId2]: 'is-excerpt', [commentId3]: 'is-excerpt' } and then
 *   hands that down to all of the PostComments so they will know how to render.
 *
 * This component will also display a caterpillar if it has any children comments that are hidden.
 * It can determine hidden state by seeing that the number of commentsToShow < totalCommentsForPost
 */

export class ConversationCommentList extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired, // required by PostComment
		commentIds: PropTypes.array.isRequired,
		shouldRequestComments: PropTypes.bool,
	};

	static defaultProps = {
		enableCaterpillar: true,
		shouldRequestComments: true,
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
		const { siteId, postId, enableCaterpillar, shouldRequestComments } = props;

		if ( ! shouldRequestComments || ! props.commentsFetchingStatus ) {
			return;
		}

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

		if ( ! post ) {
			return null;
		}

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
					{ showCaterpillar && (
						<ConversationCaterpillar blogId={ post.site_ID } postId={ post.ID } />
					) }
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
					{ ! this.state.activeReplyCommentId && (
						<PostCommentForm
							ref="postCommentForm"
							post={ post }
							parentCommentId={ null }
							commentText={ this.state.commentText }
							onUpdateCommentText={ this.onUpdateCommentText }
						/>
					) }
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
