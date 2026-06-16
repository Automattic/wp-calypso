import { keyBy } from '@automattic/js-utils';
import { map, size, filter, get, partition, pickBy } from 'lodash';
import PropTypes from 'prop-types';
import { Component, useCallback, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import PostCommentFormRoot from 'calypso/blocks/comments/form-root';
import PostComment from 'calypso/blocks/comments/post-comment';
import ConversationCaterpillar from 'calypso/blocks/conversation-caterpillar';
import { POST_COMMENT_DISPLAY_TYPES } from 'calypso/reader/comments/constants';
import {
	buildCommentsTreeForDisplay,
	mergeCommentLists,
	useComments,
	useCommentsById,
} from 'calypso/reader/data/comments';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

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
const noop = () => {};
const getCommentErrorKey = ( siteId, commentId ) => `${ siteId }-${ commentId }`;
const getPostStateKey = ( siteId, postId ) => `${ siteId }-${ postId }`;
const getInitialPostState = ( postStateKey ) => ( {
	postStateKey,
	activeReplyCommentId: null,
	commentIdsToLoad: [],
} );
const expansionValue = ( type ) => {
	const { full, excerpt, singleLine } = POST_COMMENT_DISPLAY_TYPES;
	switch ( type ) {
		case full:
			return 3;
		case excerpt:
			return 2;
		case singleLine:
			return 1;
		default:
			return 0;
	}
};

export class ConversationCommentList extends Component {
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
		filterParents: true,
	};

	state = {
		commentText: '',
		expansions: {},
	};

	onUpdateCommentText = ( commentText ) => this.setState( { commentText } );

	onReplyClick = ( commentId ) => {
		this.setActiveReplyComment( commentId );
		recordAction( 'comment_reply_click' );
		recordGaEvent( 'Clicked Reply to Comment' );
		this.props.recordReaderTracksEvent(
			'calypso_reader_comment_reply_click',
			{
				comment_id: commentId,
			},
			{ post: this.props.post }
		);
	};

	onReplyCancel = () => {
		this.setState( { commentText: '' } );
		recordAction( 'comment_reply_cancel_click' );
		recordGaEvent( 'Clicked Cancel Reply to Comment' );
		this.props.recordReaderTracksEvent(
			'calypso_reader_comment_reply_cancel_click',
			{
				comment_id: this.props.activeReplyCommentId,
			},
			{ post: this.props.post }
		);
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

	componentDidUpdate() {
		const { commentsTree, siteId, commentErrors } = this.props;
		const commentsToShow = this.getCommentsToShow();
		const hiddenComments = this.getHiddenComments( commentsToShow );

		// if we are running low on comments to expand then fetch more
		if ( size( hiddenComments ) < FETCH_NEW_COMMENTS_THRESHOLD ) {
			this.reqMoreComments();
		}

		// if we are missing any comments in the hierarchy towards a comment that should be shown,
		// then load them one at a time. This is not the most efficient method, ideally we could
		// load a subtree
		const inaccessible = this.getInaccessibleParentsIds(
			commentsTree,
			Object.keys( commentsToShow )
		);
		inaccessible
			.filter( ( commentId ) => ! commentErrors[ getCommentErrorKey( siteId, commentId ) ] )
			.forEach( ( commentId ) => {
				this.props.requestComment( {
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
		const { commentIds, commentsTree, sortedComments, filterParents } = this.props;
		const { expansions } = this.state;

		const minId = Math.min( ...commentIds );
		const startingCommentIds = ( sortedComments || [] )
			.filter( ( comment ) => comment.ID >= minId || comment.isPlaceholder )
			.map( ( comment ) => comment.ID );

		let parentIds = startingCommentIds;
		if ( filterParents ) {
			parentIds = parentIds.map( ( id ) => this.getParentId( commentsTree, id ) ).filter( Boolean );
		}

		const startingExpanded = Object.fromEntries(
			[ ...startingCommentIds, ...parentIds ].map( ( id ) => [
				id,
				POST_COMMENT_DISPLAY_TYPES.excerpt,
			] )
		);

		return { ...startingExpanded, ...expansions };
	};

	getHiddenComments = ( commentsToShow ) => {
		const commentsById = keyBy( this.props.sortedComments, 'ID' );

		return pickBy( commentsById, ( comment ) => ! commentsToShow[ comment.ID ] );
	};

	expandComments = ( { commentIds, displayType } ) => {
		this.setState( ( current ) => {
			const newExpansions = Object.fromEntries(
				commentIds.map( ( id ) => {
					if (
						! current.expansions[ id ] ||
						expansionValue( displayType ) > expansionValue( current.expansions[ id ] )
					) {
						return [ id, displayType ];
					}
					return [ id, current.expansions[ id ] ];
				} )
			);

			return {
				expansions: {
					...current.expansions,
					...newExpansions,
				},
			};
		} );
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
		const { commentsTree, post, enableCaterpillar, sortedComments } = this.props;

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
							comments={ sortedComments }
							commentsTree={ commentsTree }
							commentsToShow={ commentsToShow }
							expandComments={ this.expandComments }
							recordReaderTracksEvent={ this.props.recordReaderTracksEvent }
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
								onUpdateCommentText={ this.onUpdateCommentText }
								onCommentSubmit={ this.resetActiveReplyComment }
								commentText={ this.state.commentText }
								showReadMoreInActions
								displayType={ POST_COMMENT_DISPLAY_TYPES.excerpt }
								expandComments={ this.expandComments }
								comments={ sortedComments }
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

const ConversationCommentListWithData = ( props ) => {
	const { currentUserId, post } = props;
	const siteId = post.site_ID;
	const postId = post.ID;
	const postStateKey = getPostStateKey( siteId, postId );
	const [ localPostState, setLocalPostState ] = useState( () =>
		getInitialPostState( postStateKey )
	);
	const { activeReplyCommentId, commentIdsToLoad } =
		localPostState.postStateKey === postStateKey
			? localPostState
			: getInitialPostState( postStateKey );
	const { comments: additionalComments, commentErrors } = useCommentsById( {
		siteId,
		postId,
		commentIds: commentIdsToLoad,
	} );
	const comments = useComments( {
		siteId,
		postId,
		status: 'approved',
		displayStatus: 'all',
		commentTotal: post.discussion.comment_count,
		authorId: currentUserId,
	} );
	const sortedComments = useMemo(
		() => mergeCommentLists( comments.comments, additionalComments ),
		[ additionalComments, comments.comments ]
	);
	const commentsTree = useMemo(
		() =>
			buildCommentsTreeForDisplay( {
				comments: sortedComments,
				displayStatus: 'all',
				authorId: currentUserId,
			} ),
		[ currentUserId, sortedComments ]
	);
	const { fetchEarlierComments, fetchLaterComments } = comments;
	const paginationRequestsInFlight = useRef( new Set() );

	const requestPostComments = useCallback(
		( { direction } ) => {
			if ( direction === 'before' ) {
				if ( paginationRequestsInFlight.current.has( direction ) ) {
					return;
				}
				paginationRequestsInFlight.current.add( direction );
				return fetchEarlierComments( { cancelRefetch: false } ).finally( () =>
					paginationRequestsInFlight.current.delete( direction )
				);
			}

			if ( direction === 'after' ) {
				if ( paginationRequestsInFlight.current.has( direction ) ) {
					return;
				}
				paginationRequestsInFlight.current.add( direction );
				return fetchLaterComments( { cancelRefetch: false } ).finally( () =>
					paginationRequestsInFlight.current.delete( direction )
				);
			}
		},
		[ fetchEarlierComments, fetchLaterComments ]
	);

	const requestComment = useCallback(
		( { commentId } ) =>
			setLocalPostState( ( current ) => {
				const currentPostState =
					current.postStateKey === postStateKey ? current : getInitialPostState( postStateKey );

				if ( currentPostState.commentIdsToLoad.includes( commentId ) ) {
					return current;
				}

				return {
					...currentPostState,
					commentIdsToLoad: [ ...currentPostState.commentIdsToLoad, commentId ],
				};
			} ),
		[ postStateKey ]
	);

	const setActiveReply = useCallback(
		( { commentId } ) => {
			setLocalPostState( ( current ) => {
				const currentPostState =
					current.postStateKey === postStateKey ? current : getInitialPostState( postStateKey );

				if ( currentPostState.activeReplyCommentId === commentId ) {
					return current;
				}

				return {
					...currentPostState,
					activeReplyCommentId: commentId,
				};
			} );
		},
		[ postStateKey ]
	);

	return (
		<ConversationCommentList
			{ ...props }
			siteId={ siteId }
			postId={ postId }
			sortedComments={ sortedComments }
			commentsTree={ commentsTree }
			commentsFetchingStatus={ comments.commentsFetchingStatus }
			activeReplyCommentId={ activeReplyCommentId }
			commentErrors={ commentErrors }
			requestPostComments={ requestPostComments }
			requestComment={ requestComment }
			setActiveReply={ setActiveReply }
		/>
	);
};

const ConnectedConversationCommentList = connect(
	( state ) => {
		return {
			currentUserId: getCurrentUserId( state ),
		};
	},
	{ recordReaderTracksEvent }
)( ConversationCommentListWithData );

export default ConnectedConversationCommentList;
