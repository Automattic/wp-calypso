/**
 * External dependencies
 */
import React, { Component } from 'react';
import { get, noop, some } from 'lodash';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { getCurrentUser } from 'state/current-user/selectors';
import PostTime from 'reader/post-time';
import Gravatar from 'components/gravatar';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import { getStreamUrl } from 'reader/route';
import PostCommentContent from './post-comment-content';
import PostCommentForm from './form';
import CommentEditForm from './comment-edit-form';
import { PLACEHOLDER_STATE } from 'state/comments/constants';
import { decodeEntities } from 'lib/formatting';
import PostCommentWithError from './post-comment-with-error';
import PostTrackback from './post-trackback.jsx';
import CommentActions from './comment-actions';

class PostComment extends Component {
	state = {
		showReplies: false,
	};

	handleToggleRepliesClick = () => {
		this.setState( { showReplies: ! this.state.showReplies } );
	};

	handleReply = () => {
		this.props.onReplyClick( this.props.commentId );
		this.setState( { showReplies: true } ); // show the comments when replying
	};

	handleAuthorClick = event => {
		recordAction( 'comment_author_click' );
		recordGaEvent( 'Clicked Author Name' );
		recordTrack( 'calypso_reader_comment_author_click', {
			blog_id: this.props.post.site_ID,
			post_id: this.props.post.ID,
			comment_id: this.props.commentId,
			author_url: event.target.href,
		} );
	};

	// current hack because our css basically just indents anything 0,1,2.  TODO: make depth meaningful
	getDepth = () => this.props.depth > this.props.maxDepth ? 4 : this.props.depth;

	renderRepliesList() {
		const commentChildrenIds = get( this.props.commentsTree, [ this.props.commentId, 'children' ] );
		// Hide children if more than maxChildrenToShow, but not if replying
		const exceedsMaxChildrenToShow = commentChildrenIds && commentChildrenIds.length < this.props.maxChildrenToShow;
		const showReplies = this.state.showReplies || exceedsMaxChildrenToShow;

		// No children to show
		if ( ! commentChildrenIds || commentChildrenIds.length < 1 ) {
			return null;
		}

		const showRepliesText = translate(
			'show %(numOfReplies)d reply',
			'show %(numOfReplies)d replies',
			{
				count: commentChildrenIds.length,
				args: { numOfReplies: commentChildrenIds.length },
			},
		);

		const hideRepliesText = translate(
			'hide %(numOfReplies)d reply',
			'hide %(numOfReplies)d replies',
			{
				count: commentChildrenIds.length,
				args: { numOfReplies: commentChildrenIds.length },
			},
		);

		let replyVisibilityText = null;
		if ( ! exceedsMaxChildrenToShow ) {
			replyVisibilityText = this.state.showReplies ? hideRepliesText : showRepliesText;
		}

		return (
			<div>
				{ !! replyVisibilityText
					? <button
							className="comments__view-replies-btn"
							onClick={ this.handleToggleRepliesClick }
						>
							<Gridicon icon="reply" size={ 18 } /> { replyVisibilityText }
						</button>
					: null }
				{ showReplies
					? <ol className="comments__list">
							{ commentChildrenIds.map( childId =>
								<PostComment
									{ ...this.props }
									depth={ this.getDepth() + 1 }
									key={ childId }
									commentId={ childId }
								/>,
							) }
						</ol>
					: null }
			</div>
		);
	}

	renderCommentForm() {
		if ( this.props.activeReplyCommentID !== this.props.commentId ) {
			return null;
		}

		return (
			<PostCommentForm
				ref="postCommentForm"
				post={ this.props.post }
				parentCommentID={ this.props.commentId }
				commentText={ this.props.commentText }
				onUpdateCommentText={ this.props.onUpdateCommentText }
				onCommentSubmit={ this.props.onCommentSubmit }
			/>
		);
	}

	render() {
		// todo: connect this constants to the state (new selector)
		const commentsTree = this.props.commentsTree;
		const comment = get( commentsTree, [ this.props.commentId, 'data' ] );

		// todo: connect this constants to the state (new selector)
		const haveReplyWithError = some(
			get( commentsTree, [ this.props.commentId, 'children' ] ),
			childId =>
				get( commentsTree, [ childId, 'data', 'placeholderState' ] ) === PLACEHOLDER_STATE.ERROR,
		);

		// If it's a pending comment, use the current user as the author
		if ( comment.isPlaceholder ) {
			comment.author = this.props.currentUser;
			comment.author.name = this.props.currentUser.display_name;
		} else {
			comment.author.name = decodeEntities( comment.author.name );
		}

		// If we have an error, render the error component instead
		if ( comment.isPlaceholder && comment.placeholderState === PLACEHOLDER_STATE.ERROR ) {
			return <PostCommentWithError { ...this.props } repliesList={ this.renderRepliesList() } />;
		}

		// Trackback / Pingback
		if ( comment.type === 'trackback' || comment.type === 'pingback' ) {
			return <PostTrackback { ...this.props } />;
		}

		// Author URL
		let authorUrl;
		if ( comment.author.site_ID ) {
			authorUrl = getStreamUrl( null, comment.author.site_ID );
		} else if ( comment.author.URL ) {
			authorUrl = comment.author.URL;
		}

		const parentComment = get( commentsTree, [ get( comment, 'parent.ID' ), 'data' ], {} );
		const parentAuthor = parentComment.author;
		const parentAuthorUrl = parentAuthor && parentAuthor.site_ID
			? getStreamUrl( null, parentComment.author.site_ID )
			: parentAuthor && parentAuthor.URL;

		return (
			<li className={ 'comments__comment depth-' + this.getDepth() }>
				<div className="comments__comment-author">
					{ authorUrl
						? <a href={ authorUrl } onClick={ this.handleAuthorClick }>
								<Gravatar user={ comment.author } />
							</a>
						: <Gravatar user={ comment.author } /> }

					{ authorUrl
						? <a
							href={ authorUrl }
							className="comments__comment-username"
							onClick={ this.handleAuthorClick }
							id={ `comment-${ this.props.commentId }` }
							>
								{ comment.author.name }
							</a>
						: <strong
							className="comments__comment-username"
							id={ `comment-${ this.props.commentId }` }
							>
								{ comment.author.name }
							</strong> }
						{ this.props.showNestingReplyArrow && parentAuthorUrl &&
							<span> > <a className="comments__comment-respondee" href={ parentAuthorUrl }>
								{ parentAuthor.name }
							</a> </span>
						}
					<div className="comments__comment-timestamp">
						<a href={ comment.URL }>
							<PostTime date={ comment.date } />
						</a>
					</div>
				</div>

				{ comment.status && comment.status === 'unapproved'
					? <p className="comments__comment-moderation">
							{ translate( 'Your comment is awaiting moderation.' ) }
						</p>
					: null }

				{ this.props.activeEditCommentId !== this.props.commentId &&
					<PostCommentContent
						content={ comment.content }
						isPlaceholder={ comment.isPlaceholder }
					/> }

				{ isEnabled( 'comments/moderation-tools-in-posts' ) &&
					this.props.activeEditCommentId === this.props.commentId &&
					<CommentEditForm
						post={ this.props.post }
						commentId={ this.props.commentId }
						commentText={ comment.content }
						onCommentSubmit={ this.props.onEditCommentCancel }
					/> }

				<CommentActions
					post={ this.props.post }
					comment={ comment }
					showModerationTools={ this.props.showModerationTools }
					activeEditCommentId={ this.props.activeEditCommentId }
					activeReplyCommentID={ this.props.activeReplyCommentID }
					commentId={ this.props.commentId }
					editComment={ this.props.onEditCommentClick }
					editCommentCancel={ this.props.onEditCommentCancel }
					handleReply={ this.handleReply }
					onReplyCancel={ this.props.onReplyCancel }
				/>

				{ haveReplyWithError ? null : this.renderCommentForm() }
				{ this.renderRepliesList() }
			</li>
		);
	}
}

PostComment.propTypes = {
	commentsTree: React.PropTypes.object.isRequired,
	commentId: React.PropTypes.oneOfType( [
		React.PropTypes.string, // can be 'placeholder-123'
		React.PropTypes.number,
	] ).isRequired,
	onReplyClick: React.PropTypes.func,
	depth: React.PropTypes.number,
	post: React.PropTypes.object,
	maxChildrenToShow: React.PropTypes.number,
	onCommentSubmit: React.PropTypes.func,
	maxDepth: React.PropTypes.number,
	showNestingReplyArrow: React.PropTypes.bool,

	// connect()ed props:
	currentUser: React.PropTypes.object.isRequired,
};

PostComment.defaultProps = {
	onReplyClick: noop,
	errors: [],
	depth: 1,
	maxDepth: Infinity,
	maxChildrenToShow: 5,
	onCommentSubmit: noop,
	showNestingReplyArrow: false,
};

export default connect( state => ( {
	currentUser: getCurrentUser( state ),
} ) )( PostComment );
