/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { get, noop, some, flatMap } from 'lodash';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';
import Gridicon from 'gridicons';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { getCurrentUser } from 'state/current-user/selectors';
import TimeSince from 'components/time-since';
import Gravatar from 'components/gravatar';
import { recordAction, recordGaEvent, recordTrack, recordPermalinkClick } from 'reader/stats';
import { getStreamUrl } from 'reader/route';
import PostCommentContent from './post-comment-content';
import PostCommentForm from './form';
import CommentEditForm from './comment-edit-form';
import { PLACEHOLDER_STATE } from 'state/comments/constants';
import { decodeEntities } from 'lib/formatting';
import PostCommentWithError from './post-comment-with-error';
import PostTrackback from './post-trackback';
import CommentActions from './comment-actions';
import Emojify from 'components/emojify';
import { POST_COMMENT_DISPLAY_TYPES } from 'state/comments/constants';
import ConversationCaterpillar from 'blocks/conversation-caterpillar';
import withDimensions from 'lib/with-dimensions';
import { expandComments } from 'state/comments/actions';

/**
 * A PostComment is the visual representation for a comment within a tree of comments.
 * Each comment may have a different displayType.  It will be one of:
 *  1. full: display the full content.  no max-height.
 *  2. excerpt: show 3 lines.  max-height clipping is involved.  if the content overflows
 *       then show a "Read More" button that will the comment to full
 *  3. singleLine: show only 1 line of the comment and then show a Read More if the content overflows.
 *  4. hidden: do not show at all.  this is implied by a lack of displayType.
 *
 * - An individual PostComment determines its displayType by looking at the prop commentsToShow.
 *      displayType = commentsToShow[ commentId ] || hidden;
 * - If a PostComment has caterpillars enabled, it will show a caterpillar if it has hidden children.
 *
 * As of the time of this comment writing, ReaderFullPost uses exclusively 'full' comments, whereas
 *   conversations tool uses a mix depending on the situation.
 */

class PostComment extends React.PureComponent {
	static propTypes = {
		commentsTree: PropTypes.object.isRequired,
		commentId: PropTypes.oneOfType( [
			PropTypes.string, // can be 'placeholder-123'
			PropTypes.number,
		] ).isRequired,
		onReplyClick: PropTypes.func,
		depth: PropTypes.number,
		post: PropTypes.object,
		maxChildrenToShow: PropTypes.number,
		onCommentSubmit: PropTypes.func,
		maxDepth: PropTypes.number,
		showNestingReplyArrow: PropTypes.bool,
		showReadMoreInActions: PropTypes.bool,
		hidePingbacksAndTrackbacks: PropTypes.bool,

		/**
		 * If commentsToShow is not provided then it is assumed that all child comments should be displayed.
		 * If it is provided then it should have the following shape:
		 * {
		 *   [ commentId ]: POST_COMMENT_DISPLAY_TYPE // (full, excerpt, singleLine, etc.)
		 * }
		 * - it specifies exactly which comments to display and with which displayType.
		 * - if a comment's id is not in the object it is assumed that it should be hidden
		 *
		 */
		commentsToShow: PropTypes.object,

		enableCaterpillar: PropTypes.bool,

		// connect()ed props:
		currentUser: PropTypes.object.isRequired,
	};

	static defaultProps = {
		onReplyClick: noop,
		errors: [],
		depth: 1,
		maxDepth: Infinity,
		maxChildrenToShow: 5,
		onCommentSubmit: noop,
		showNestingReplyArrow: false,
		showReadMoreInActions: false,
		hidePingbacksAndTrackbacks: false,
	};

	state = {
		showReplies: false,
		showFull: false,
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

	handleCommentPermalinkClick = event => {
		recordPermalinkClick(
			'timestamp_comment',
			{},
			{
				blog_id: this.props.post.site_ID,
				post_id: this.props.post.ID,
				comment_id: this.props.commentId,
				author_url: event.target.href,
			}
		);
	};

	getAllChildrenIds = id => {
		const { commentsTree } = this.props;

		if ( ! id ) {
			return [];
		}

		const immediateChildren = get( commentsTree, [ id, 'children' ], [] );
		return immediateChildren.concat(
			flatMap( immediateChildren, childId => this.getAllChildrenIds( childId ) )
		);
	};

	// has hidden child --> true
	shouldRenderCaterpillar = () => {
		const { enableCaterpillar, commentsToShow, commentId } = this.props;
		const childIds = this.getAllChildrenIds( commentId );

		return enableCaterpillar && commentsToShow && some( childIds, id => ! commentsToShow[ id ] );
	};

	// has visisble child --> true
	shouldRenderReplies = () => {
		const { commentsToShow, commentId } = this.props;
		const childIds = this.getAllChildrenIds( commentId );

		return commentsToShow && some( childIds, id => commentsToShow[ id ] );
	};

	renderRepliesList() {
		const {
			commentsToShow,
			depth,
			commentId,
			commentsTree,
			maxChildrenToShow,
			enableCaterpillar,
			post,
			maxDepth,
		} = this.props;

		const commentChildrenIds = get( commentsTree, [ commentId, 'children' ] );
		// Hide children if more than maxChildrenToShow, but not if replying
		const exceedsMaxChildrenToShow =
			commentChildrenIds && commentChildrenIds.length < maxChildrenToShow;
		const showReplies = this.state.showReplies || exceedsMaxChildrenToShow || enableCaterpillar;
		const childDepth = ! commentsToShow || commentsToShow[ commentId ] ? depth + 1 : depth;

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
			}
		);

		const hideRepliesText = translate(
			'hide %(numOfReplies)d reply',
			'hide %(numOfReplies)d replies',
			{
				count: commentChildrenIds.length,
				args: { numOfReplies: commentChildrenIds.length },
			}
		);

		let replyVisibilityText = null;
		if ( ! exceedsMaxChildrenToShow && ! enableCaterpillar ) {
			replyVisibilityText = this.state.showReplies ? hideRepliesText : showRepliesText;
		}

		return (
			<div>
				{ !! replyVisibilityText && (
					<button className="comments__view-replies-btn" onClick={ this.handleToggleRepliesClick }>
						<Gridicon icon="reply" size={ 18 } /> { replyVisibilityText }
					</button>
				) }
				{ showReplies && (
					<ol className="comments__list">
						{ commentChildrenIds.map( childId => (
							<ConnectedPostComment
								showNestingReplyArrow={ this.props.showNestingReplyArrow }
								showReadMoreInActions={ this.props.showReadMoreInActions }
								enableCaterpillar={ enableCaterpillar }
								depth={ childDepth }
								maxDepth={ maxDepth }
								key={ childId }
								commentId={ childId }
								commentsTree={ commentsTree }
								commentsToShow={ commentsToShow }
								post={ post }
								onReplyClick={ this.props.onReplyClick }
								onReplyCancel={ this.props.onReplyCancel }
								activeReplyCommentId={ this.props.activeReplyCommentId }
								onEditCommentClick={ this.props.onEditCommentClick }
								onEditCommentCancel={ this.props.onEditCommentCancel }
								activeEditCommentId={ this.props.activeEditCommentId }
								onUpdateCommentText={ this.props.onUpdateCommentText }
								onCommentSubmit={ this.props.onCommentSubmit }
							/>
						) ) }
					</ol>
				) }
			</div>
		);
	}

	renderCommentForm() {
		if ( this.props.activeReplyCommentId !== this.props.commentId ) {
			return null;
		}

		// If a comment save is pending, don't show the form
		const placeholderState = get( this.props.commentsTree, [
			this.props.commentId,
			'data',
			'placeholderState',
		] );
		if ( placeholderState === PLACEHOLDER_STATE.PENDING ) {
			return null;
		}

		return (
			<PostCommentForm
				ref="postCommentForm"
				post={ this.props.post }
				parentCommentId={ this.props.commentId }
				commentText={ this.props.commentText }
				onUpdateCommentText={ this.props.onUpdateCommentText }
				onCommentSubmit={ this.props.onCommentSubmit }
			/>
		);
	}

	getAuthorDetails = commentId => {
		const comment = get( this.props.commentsTree, [ commentId, 'data' ], {} );
		const commentAuthor = get( comment, 'author', {} );
		const commentAuthorName = decodeEntities( commentAuthor.name );
		const commentAuthorUrl = !! commentAuthor.site_ID
			? getStreamUrl( null, commentAuthor.site_ID )
			: commentAuthor && commentAuthor.URL;
		return { comment, commentAuthor, commentAuthorUrl, commentAuthorName };
	};

	renderAuthorTag = ( { authorName, authorUrl, commentId, className } ) => {
		return !! authorUrl ? (
			<a
				href={ authorUrl }
				className={ className }
				onClick={ this.handleAuthorClick }
				id={ `comment-${ commentId }` }
			>
				<Emojify>{ authorName }</Emojify>
			</a>
		) : (
			<strong className={ className } id={ `comment-${ commentId }` }>
				<Emojify>{ authorName }</Emojify>
			</strong>
		);
	};

	onReadMore = () => {
		this.setState( { showFull: true } );
		this.props.post &&
			this.props.expandComments( {
				siteId: this.props.post.site_ID,
				commentIds: [ this.props.commentId ],
				postId: this.props.post.ID,
				displayType: POST_COMMENT_DISPLAY_TYPES.full,
			} );
		recordAction( 'comment_read_more_click' );
		recordGaEvent( 'Clicked Comment Read More' );
		recordTrack( 'calypso_reader_comment_read_more_click', {
			blog_id: this.props.post.site_ID,
			post_id: this.props.post.ID,
			comment_id: this.props.commentId,
		} );
	};

	render() {
		const {
			commentsTree,
			commentId,
			depth,
			enableCaterpillar,
			maxDepth,
			post,
			commentsToShow,
			overflowY,
			showReadMoreInActions,
			hidePingbacksAndTrackbacks,
		} = this.props;

		const comment = get( commentsTree, [ commentId, 'data' ] );
		const isPingbackOrTrackback = comment.type === 'trackback' || comment.type === 'pingback';

		if ( ! comment || ( hidePingbacksAndTrackbacks && isPingbackOrTrackback ) ) {
			return null;
		} else if ( commentsToShow && ! commentsToShow[ commentId ] ) {
			// this comment should be hidden so just render children
			return this.shouldRenderReplies() && <div>{ this.renderRepliesList() }</div>;
		}

		const displayType =
			this.state.showFull || ! enableCaterpillar
				? POST_COMMENT_DISPLAY_TYPES.full
				: commentsToShow[ commentId ];

		// todo: connect this constants to the state (new selector)
		const haveReplyWithError = some(
			get( commentsTree, [ this.props.commentId, 'children' ] ),
			childId =>
				get( commentsTree, [ childId, 'data', 'placeholderState' ] ) === PLACEHOLDER_STATE.ERROR
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
		if ( isPingbackOrTrackback ) {
			return <PostTrackback { ...this.props } />;
		}

		// Author Details
		const parentCommentId = get( comment, 'parent.ID' );
		const { commentAuthorUrl, commentAuthorName } = this.getAuthorDetails( commentId );
		const {
			commentAuthorUrl: parentAuthorUrl,
			commentAuthorName: parentAuthorName,
		} = this.getAuthorDetails( parentCommentId );

		const postCommentClassnames = classnames( 'comments__comment', {
			[ 'depth-' + depth ]: depth <= maxDepth && depth <= 3, // only indent up to 3
		} );

		/* eslint-disable wpcalypso/jsx-gridicon-size */
		return (
			<li className={ postCommentClassnames }>
				<div className="comments__comment-author">
					{ commentAuthorUrl ? (
						<a href={ commentAuthorUrl } onClick={ this.handleAuthorClick }>
							<Gravatar user={ comment.author } />
						</a>
					) : (
						<Gravatar user={ comment.author } />
					) }

					{ this.renderAuthorTag( {
						authorUrl: commentAuthorUrl,
						authorName: commentAuthorName,
						commentId,
						className: 'comments__comment-username',
					} ) }
					{ this.props.showNestingReplyArrow &&
						parentAuthorName && (
							<span className="comments__comment-respondee">
								<Gridicon icon="chevron-right" size={ 16 } />
								{ this.renderAuthorTag( {
									className: 'comments__comment-respondee-link',
									authorName: parentAuthorName,
									authorUrl: parentAuthorUrl,
									commentId: parentCommentId,
								} ) }
							</span>
						) }
					<div className="comments__comment-timestamp">
						<a
							href={ comment.URL }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ this.handleCommentPermalinkClick }
						>
							<TimeSince date={ comment.date } />
						</a>
					</div>
				</div>

				{ comment.status && comment.status === 'unapproved' ? (
					<p className="comments__comment-moderation">
						{ translate( 'Your comment is awaiting moderation.' ) }
					</p>
				) : null }

				{ this.props.activeEditCommentId !== this.props.commentId && (
					<PostCommentContent
						content={ comment.content }
						setWithDimensionsRef={ this.props.setWithDimensionsRef }
						isPlaceholder={ comment.isPlaceholder }
						className={ displayType }
					/>
				) }

				{ isEnabled( 'comments/moderation-tools-in-posts' ) &&
					this.props.activeEditCommentId === this.props.commentId && (
						<CommentEditForm
							post={ this.props.post }
							commentId={ this.props.commentId }
							commentText={ comment.content }
							onCommentSubmit={ this.props.onEditCommentCancel }
						/>
					) }

				<CommentActions
					post={ this.props.post || {} }
					comment={ comment }
					showModerationTools={ this.props.showModerationTools }
					activeEditCommentId={ this.props.activeEditCommentId }
					activeReplyCommentId={ this.props.activeReplyCommentId }
					commentId={ this.props.commentId }
					editComment={ this.props.onEditCommentClick }
					editCommentCancel={ this.props.onEditCommentCancel }
					handleReply={ this.handleReply }
					onReplyCancel={ this.props.onReplyCancel }
					showReadMore={ overflowY && ! this.state.showFull && showReadMoreInActions }
					onReadMore={ this.onReadMore }
				/>

				{ haveReplyWithError ? null : this.renderCommentForm() }
				{ this.shouldRenderCaterpillar() && (
					<ConversationCaterpillar
						blogId={ post.site_ID }
						postId={ post.ID }
						parentCommentId={ commentId }
						commentsToShow={ commentsToShow }
					/>
				) }
				{ this.renderRepliesList() }
			</li>
		);
	}
}

const ConnectedPostComment = connect(
	state => ( {
		currentUser: getCurrentUser( state ),
	} ),
	{ expandComments }
)( withDimensions( PostComment ) );

export default ConnectedPostComment;
