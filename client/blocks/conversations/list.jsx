/** @format */
/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';

/***
 * Internal dependencies
 */
import PostComment from 'blocks/comments/post-comment';
import {
	getPostCommentsTree,
	commentsFetchingStatus,
	getAllCommentSinceLatestViewed,
	getRootNeedsCaterpillar,
	getExpansionsForPost,
	getHiddenCommentsForPost,
} from 'state/comments/selectors';
import { requestPostComments } from 'state/comments/actions';
import ConversationCaterpillar from 'blocks/conversation-caterpillar';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import PostCommentForm from 'blocks/comments/form';
export class ConversationCommentList extends React.PureComponent {
	static propTypes = {
		post: PropTypes.object.isRequired, // required by PostComment
	};

	static defaultProps = {
		showCaterpillar: true,
	};

	state = {
		activeReplyCommentId: null,
		activeEditCommentId: null,
	};

	reqMoreComments = ( props = this.props ) => {
		if ( ! this.props.showCaterpillar ) {
			return;
		}

		const { blogId, postId } = props;
		const { haveEarlierCommentsToFetch, haveLaterCommentsToFetch } = props.commentsFetchingStatus;

		if ( haveEarlierCommentsToFetch || haveLaterCommentsToFetch ) {
			props.requestPostComments( { siteId: blogId, postId } );
		}
	};
	componentWillMount() {
		this.reqMoreComments();
	}

	// componentWillReceiveProps( nextProps ) {
	// this.reqMoreComments( nextProps );
	// }

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
		const {
			postId,
			blogId,
			newComments,
			commentsTree,
			post,
			showCaterpillar,
			needsCaterpillar,
			expansions,
		} = this.props;

		const toShow = { ...newComments, ...expansions };

		return (
			<div className="conversations__comment-list">
				{ showCaterpillar &&
					needsCaterpillar &&
					<ConversationCaterpillar blogId={ blogId } postId={ postId } /> }
				<ul className="conversations__comment-list-ul">
					{ map( commentsTree.children, commentId => {
						return (
							<PostComment
								showNestingReplyArrow
								hidePingbacksAndTrackbacks
								commentsTree={ commentsTree }
								key={ commentId }
								commentId={ commentId }
								maxChildrenToShow={ 0 }
								post={ post }
								showCaterpillar={ showCaterpillar }
								toShow={ toShow }
								maxDepth={ 2 }
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
			</div>
		);
	}
}

const ConnectedConversationCommentList = connect(
	( state, ownProps ) => {
		const { post } = ownProps;
		const { discussion, site_ID: blogId, ID: postId } = post;

		return {
			commentsTree: getPostCommentsTree( state, blogId, postId, 'all' ),
			commentsFetchingStatus:
				commentsFetchingStatus( state, blogId, postId, discussion.comment_count ) || {},
			blogId,
			postId,
			newComments: getAllCommentSinceLatestViewed( state, blogId, postId ),
			needsCaterpillar: getRootNeedsCaterpillar( state, blogId, postId ),
			expansions: getExpansionsForPost( state, blogId, postId ),
			hiddenComments: getHiddenCommentsForPost( state, blogId, postId ),
		};
	},
	{ requestPostComments }
)( ConversationCommentList );

export default ConnectedConversationCommentList;
