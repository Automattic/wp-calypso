/***
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';
import Gridicon from 'gridicons';

/***
 * Internal dependencies
 */
import { isEnabled } from 'config';
import {
	getCurrentUser
} from 'state/current-user/selectors';
import PostTime from 'reader/post-time';
import Gravatar from 'components/gravatar';
import {
	recordAction,
	recordGaEvent,
	recordTrack
} from 'reader/stats';
import { getStreamUrl } from 'reader/route';
import CommentLikeButtonContainer from './comment-likes';
import PostCommentContent from './post-comment-content';
import PostCommentForm from './form';
import { PLACEHOLDER_STATE } from 'state/comments/constants';
import { decodeEntities } from 'lib/formatting';
import PostCommentWithError from './post-comment-with-error';
import PostTrackback from './post-trackback.jsx';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import PopoverMenuSeparator from 'components/popover/menu-separator';

class PostComment extends React.Component {
	constructor() {
		super();

		this.state = {
			showReplies: false
		};

		// bind event handlers to this instance
		Object.getOwnPropertyNames( PostComment.prototype )
			.filter( ( prop ) => prop.indexOf( 'handle' ) === 0 )
			.filter( ( prop ) => typeof this[ prop ] === 'function' )
			.forEach( ( prop ) => this[ prop ] = this[ prop ].bind( this ) );
	}

	handleToggleRepliesClick() {
		this.setState( { showReplies: ! this.state.showReplies } );
	}

	handleReply() {
		this.props.onReplyClick( this.props.commentId );
		this.setState( { showReplies: true } ); // show the comments when replying
	}

	handleAuthorClick( event ) {
		recordAction( 'comment_author_click' );
		recordGaEvent( 'Clicked Author Name' );
		recordTrack( 'calypso_reader_comment_author_click', {
			blog_id: this.props.post.site_ID,
			post_id: this.props.post.ID,
			comment_id: this.props.commentId,
			author_url: event.target.href
		} );
	}

	renderRepliesList() {
		const commentChildrenIds = this.props.commentsTree.getIn( [ this.props.commentId, 'children' ] ).toJS();
		// Hide children if more than maxChildrenToShow, but not if replying
		const exceedsMaxChildrenToShow = commentChildrenIds.length < this.props.maxChildrenToShow;
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
				args: { numOfReplies: commentChildrenIds.length }
			}
		);

		const hideRepliesText = translate(
			'hide %(numOfReplies)d reply',
			'hide %(numOfReplies)d replies',
			{
				count: commentChildrenIds.length,
				args: { numOfReplies: commentChildrenIds.length }
			}
		);

		let replyVisibilityText = null;
		if ( ! exceedsMaxChildrenToShow ) {
			replyVisibilityText = this.state.showReplies ? hideRepliesText : showRepliesText;
		}

		return ( <div>
			{ !! replyVisibilityText
			? <button className="comments__view-replies-btn" onClick={ this.handleToggleRepliesClick }>
				<Gridicon icon="reply" size={ 18 } /> { replyVisibilityText }
			</button> : null
			}
			{ showReplies
				? <ol className="comments__list">
					{
						commentChildrenIds.reverse().map( ( childId ) =>
							<PostComment { ...this.props } depth={ this.props.depth + 1 } key={ childId } commentId={ childId }/>
						)
					}
				</ol>
				: null
			}
		</div> );
	}

	renderCommentForm() {
		if ( this.props.activeReplyCommentID !== this.props.commentId ) {
			return null;
		}

		return <PostCommentForm
			ref="postCommentForm"
			post={ this.props.post }
			parentCommentID={ this.props.commentId }
			commentText={ this.props.commentText }
			onUpdateCommentText={ this.props.onUpdateCommentText }
			onCommentSubmit={ this.props.onCommentSubmit } />;
	}

	renderCommentActions( comment ) {
		const post = this.props.post;
		const showReplyButton = post && post.discussion && post.discussion.comments_open === true;
		const showCancelReplyButton = this.props.activeReplyCommentID === this.props.commentId;

		// Only render actions for non placeholders and approved
		if ( comment.isPlaceholder || comment.status !== 'approved' ) {
			return null;
		}

		return (
			<div className="comments__comment-actions">
				{ showReplyButton
					? <button className="comments__comment-actions-reply" onClick={ this.handleReply }>
						<Gridicon icon="reply" size={ 18 } />
						<span className="comments__comment-actions-reply-label">{ translate( 'Reply' ) }</span>
					</button>
					: null }
				{ showCancelReplyButton && <button className="comments__comment-actions-cancel-reply" onClick={ this.props.onReplyCancel }>{ translate( 'Cancel reply' ) }</button> }
				<CommentLikeButtonContainer
					className="comments__comment-actions-like"
					tagName="button"
					siteId={ this.props.post.site_ID }
					postId={ this.props.post.ID }
					commentId={ comment.ID }
				/>
				{
					isEnabled( 'comments/moderation-tools-in-posts' ) &&
					<button className="comments__comment-actions-like" onClick={ () => {} }>
						<Gridicon icon="checkmark" size={ 18 }/>
						<span className="comments__comment-actions-like-label">{ translate( 'Approve' )}</span>
					</button>
				}
				{
					isEnabled( 'comments/moderation-tools-in-posts' ) &&
					<button className="comments__comment-actions-like" onClick={ () => {} }>
						<Gridicon icon="trash" size={ 18 }/>
						<span className="comments__comment-actions-like-label">{ translate( 'Trash' )}</span>
					</button>
				}
				{
					isEnabled( 'comments/moderation-tools-in-posts' ) &&
					<button className="comments__comment-actions-like" onClick={ () => {} }>
						<Gridicon icon="spam" size={ 18 }/>
						<span className="comments__comment-actions-like-label">{ translate( 'Spam' )}</span>
					</button>
				}
				{
					isEnabled( 'comments/moderation-tools-in-posts' ) &&
					<button className="comments__comment-actions-like" onClick={ () => {} }>
						<Gridicon icon="pencil" size={ 18 }/>
						<span className="comments__comment-actions-like-label">{ translate( 'Edit' )}</span>
					</button>
				}
				{
					isEnabled( 'comments/moderation-tools-in-posts' ) &&
					<EllipsisMenu toggleTitle={ translate( 'More' ) }>
						<PopoverMenuItem icon="checkmark" onClick={ () => {} }>{ translate( 'Approve' ) }</PopoverMenuItem>
						<PopoverMenuItem icon="trash" onClick={ () => {} }>{ translate( 'Trash' ) }</PopoverMenuItem>
						<PopoverMenuItem icon="spam" onClick={ () => {} }>{ translate( 'Spam' ) }</PopoverMenuItem>
						<PopoverMenuSeparator />
						<PopoverMenuItem icon="pencil" onClick={ () => {} }>{ translate( 'Edit' ) }</PopoverMenuItem>
					</EllipsisMenu>
				}
			</div>
		);
	}

	render() {
		const commentsTree = this.props.commentsTree;
		const comment = commentsTree.getIn( [ this.props.commentId, 'data' ] ).toJS();
		const haveReplyWithError = commentsTree.getIn( [ this.props.commentId, 'children' ] )
			.some( ( childId ) => commentsTree.getIn( [ childId, 'data', 'placeholderState' ] ) === PLACEHOLDER_STATE.ERROR );

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

		return (
			<li className={ 'comments__comment depth-' + this.props.depth }>
				<div className="comments__comment-author">
					{ authorUrl
						? <a href={ authorUrl } onClick={ this.handleAuthorClick }>
							<Gravatar user={ comment.author } />
						</a>
						: <Gravatar user={ comment.author } /> }

					{ authorUrl
						? <a href={ authorUrl } className="comments__comment-username" onClick={ this.handleAuthorClick }>{ comment.author.name }</a>
						: <strong className="comments__comment-username">{ comment.author.name }</strong> }
					<div className="comments__comment-timestamp">
						<a href={ comment.URL }>
							<PostTime date={ comment.date } />
						</a>
					</div>
				</div>

				{ comment.status && comment.status === 'unapproved'
					? <p className="comments__comment-moderation">{ translate( 'Your comment is awaiting moderation.' ) }</p>
					: null }

				<PostCommentContent content={ comment.content } isPlaceholder={ comment.isPlaceholder } />

				{ this.renderCommentActions( comment ) }
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
		React.PropTypes.number
	] ).isRequired,
	onReplyClick: React.PropTypes.func,
	depth: React.PropTypes.number,
	post: React.PropTypes.object,
	maxChildrenToShow: React.PropTypes.number,
	onCommentSubmit: React.PropTypes.func,

	// connect()ed props:
	currentUser: React.PropTypes.object.isRequired
};

PostComment.defaultProps = {
	onReplyClick: noop,
	errors: [],
	depth: 1,
	maxChildrenToShow: 5,
	onCommentSubmit: noop
};

export default connect(
	( state ) => ( {
		currentUser: getCurrentUser( state )
	} )
)( PostComment );
