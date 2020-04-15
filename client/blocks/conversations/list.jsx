/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { map, zipObject, fill, size, filter, get, compact, partition, min, noop } from 'lodash';

/**
 * Internal dependencies
 */
import PostComment from 'blocks/comments/post-comment';
import { POST_COMMENT_DISPLAY_TYPES } from 'state/comments/constants';
import {
	commentsFetchingStatus,
	getActiveReplyCommentId,
	getCommentErrors,
	getDateSortedPostComments,
	getExpansionsForPost,
	getHiddenCommentsForPost,
	getPostCommentsTree,
} from 'state/comments/selectors';
import ConversationCaterpillar from 'blocks/conversation-caterpillar';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import PostCommentFormRoot from 'blocks/comments/form-root';
import { requestPostComments, requestComment, setActiveReply } from 'state/comments/actions';
import { getErrorKey } from 'state/comments/utils';
import { getCurrentUserId } from 'state/current-user/selectors';

/**
 * Style dependencies
 */
import './list.scss';

/**
 * ConversationsCommentList is the component that represents all of the comments for a conversations-stream
 * Some of it is boilerplate stolen from PostCommentList (all the activeXCommentId bits) but the special
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
 * It can determine hidden state by seeing that the number of commentsToShow < totalCommentsForPost.
 */

const FETCH_NEW_COMMENTS_THRESHOLD = 20;
export class ConversationCommentList extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired, // required by PostComment
		commentIds: PropTypes.array.isRequired,
		shouldRequestComments: PropTypes.bool,
		setActiveReply: PropTypes.func,
	};

	static defaultProps = {
		enableCaterpillar: true,
		shouldRequestComments: true,
		setActiveReply: noop,
	};

	state = {
		activeEditCommentId: null,
	};

	onEditCommentClick = ( commentId ) => this.setState( { activeEditCommentId: commentId } );
	onEditCommentCancel = () => this.setState( { activeEditCommentId: null } );
	onUpdateCommentText = ( commentText ) => this.setState( { commentText: commentText } );

	onReplyClick = ( commentId ) => {
		this.setActiveReplyComment( commentId );
		recordAction( 'comment_reply_click' );
		recordGaEvent( 'Clicked Reply to Comment' );
		recordTrack( 'calypso_reader_comment_reply_click', {
			blog_id: this.props.post.site_ID,
			comment_id: commentId,
		} );
	};

	onReplyCancel = () => {
		this.setState( { commentText: null } );
		recordAction( 'comment_reply_cancel_click' );
		recordGaEvent( 'Clicked Cancel Reply to Comment' );
		recordTrack( 'calypso_reader_comment_reply_cancel_click', {
			blog_id: this.props.post.site_ID,
			comment_id: this.props.activeReplyCommentId,
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
			const direction = haveEarlierCommentsToFetch ? 'before' : 'after';
			props.requestPostComments( { siteId, postId, direction } );
		}
	};

	componentDidMount() {
		this.resetActiveReplyComment();
		this.reqMoreComments();
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { hiddenComments, commentsTree, siteId, commentErrors } = nextProps;

		// if we are running low on comments to expand then fetch more
		if ( size( hiddenComments ) < FETCH_NEW_COMMENTS_THRESHOLD ) {
			this.reqMoreComments();
		}

		// if we are missing any comments in the hierarchy towards a comment that should be shown,
		// then load them one at a time. This is not the most efficient method, ideally we could
		// load a subtree
		const inaccessible = this.getInaccessibleParentsIds(
			commentsTree,
			Object.keys( this.getCommentsToShow() )
		);
		inaccessible
			.filter( ( commentId ) => ! commentErrors[ getErrorKey( siteId, commentId ) ] )
			.forEach( ( commentId ) => {
				nextProps.requestComment( {
					commentId,
					siteId,
				} );
			} );
	}

	getParentId = ( commentsTree, childId ) =>
		get( commentsTree, [ childId, 'data', 'parent', 'ID' ] );
	commentHasParent = ( commentsTree, childId ) => !! this.getParentId( commentsTree, childId );
	commentIsLoaded = ( commentsTree, commentId ) => !! get( commentsTree, commentId );

	getInaccessibleParentsIds = ( commentsTree, commentIds ) => {
		// base case
		if ( size( commentIds ) === 0 ) {
			return [];
		}

		const withParents = filter( commentIds, ( id ) => this.commentHasParent( commentsTree, id ) );
		const parentIds = map( withParents, ( id ) => this.getParentId( commentsTree, id ) );

		const [ accessible, inaccessible ] = partition( parentIds, ( id ) =>
			this.commentIsLoaded( commentsTree, id )
		);

		return inaccessible.concat( this.getInaccessibleParentsIds( commentsTree, accessible ) );
	};

	// @todo: move all expanded comment set per commentId logic to memoized selectors
	getCommentsToShow = () => {
		const { commentIds, expansions, commentsTree, sortedComments } = this.props;

		const minId = min( commentIds );
		const startingCommentIds = ( sortedComments || [] )
			.filter( ( comment ) => {
				return comment.ID >= minId || comment.isPlaceholder;
			} )
			.map( ( comment ) => comment.ID );

		const parentIds = compact(
			map( startingCommentIds, ( id ) => this.getParentId( commentsTree, id ) )
		);
		const commentExpansions = fill(
			Array( startingCommentIds.length ),
			POST_COMMENT_DISPLAY_TYPES.excerpt
		);
		const parentExpansions = fill( Array( parentIds.length ), POST_COMMENT_DISPLAY_TYPES.excerpt );

		const startingExpanded = zipObject(
			startingCommentIds.concat( parentIds ),
			commentExpansions.concat( parentExpansions )
		);

		return { ...startingExpanded, ...expansions };
	};

	setActiveReplyComment = ( commentId ) => {
		const siteId = get( this.props, 'post.site_ID' );
		const postId = get( this.props, 'post.ID' );

		if ( ! siteId || ! postId ) {
			return;
		}

		this.props.setActiveReply( {
			siteId,
			postId,
			commentId,
		} );
	};

	resetActiveReplyComment = () => {
		this.setActiveReplyComment( null );
	};

	render() {
		const { commentsTree, post, enableCaterpillar } = this.props;

		if ( ! post ) {
			return null;
		}

		const commentsToShow = this.getCommentsToShow();
		const isDoneLoadingComments =
			! this.props.commentsFetchingStatus.haveEarlierCommentsToFetch &&
			! this.props.commentsFetchingStatus.haveLaterCommentsToFetch;

		// if you have finished loading comments, then lets use the comments we have as the final comment count
		// if we are still loading comments, then assume what the server initially told us is right
		const commentCount = isDoneLoadingComments
			? filter( commentsTree, ( comment ) => get( comment, 'data.type' ) === 'comment' ).length // filter out pingbacks/trackbacks
			: post.discussion.comment_count;

		const showCaterpillar = enableCaterpillar && size( commentsToShow ) < commentCount;

		return (
			<div className="conversations__comment-list">
				<ul className="conversations__comment-list-ul">
					{ showCaterpillar && (
						<ConversationCaterpillar
							blogId={ post.site_ID }
							postId={ post.ID }
							commentCount={ commentCount }
							commentsToShow={ commentsToShow }
						/>
					) }
					{ map( commentsTree.children, ( commentId ) => {
						return (
							<PostComment
								showNestingReplyArrow
								hidePingbacksAndTrackbacks
								enableCaterpillar={ enableCaterpillar }
								post={ post }
								commentsTree={ commentsTree }
								key={ commentId }
								commentId={ commentId }
								maxDepth={ 2 }
								commentsToShow={ commentsToShow }
								onReplyClick={ this.onReplyClick }
								onReplyCancel={ this.onReplyCancel }
								activeReplyCommentId={ this.props.activeReplyCommentId }
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
					<PostCommentFormRoot
						post={ this.props.post }
						commentsTree={ this.props.commentsTree }
						commentText={ this.state.commentText }
						onUpdateCommentText={ this.onUpdateCommentText }
						activeReplyCommentId={ this.props.activeReplyCommentId }
					/>
				</ul>
			</div>
		);
	}
}

const ConnectedConversationCommentList = connect(
	( state, ownProps ) => {
		const { site_ID: siteId, ID: postId, discussion } = ownProps.post;
		const authorId = getCurrentUserId( state );
		return {
			siteId,
			postId,
			sortedComments: getDateSortedPostComments( state, siteId, postId ),
			commentsTree: getPostCommentsTree( state, siteId, postId, 'all', authorId ),
			commentsFetchingStatus:
				commentsFetchingStatus( state, siteId, postId, discussion.comment_count ) || {},
			expansions: getExpansionsForPost( state, siteId, postId ),
			hiddenComments: getHiddenCommentsForPost( state, siteId, postId ),
			activeReplyCommentId: getActiveReplyCommentId( {
				state,
				siteId,
				postId,
			} ),
			commentErrors: getCommentErrors( state ),
		};
	},
	{ requestPostComments, requestComment, setActiveReply }
)( ConversationCommentList );

export default ConnectedConversationCommentList;
