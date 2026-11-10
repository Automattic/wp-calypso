import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	buildCommentsTreeForDisplay,
	mergeCommentLists,
	useComment,
	useComments,
} from 'calypso/reader/data/comments';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';

const ensureInitialCommentVisible = ( commentsTree, initialComment ) => {
	if (
		! initialComment ||
		! commentsTree[ initialComment.ID ] ||
		initialComment.parent === false ||
		commentsTree[ initialComment.parent?.ID ] ||
		commentsTree.children.includes( initialComment.ID )
	) {
		return commentsTree;
	}

	return {
		...commentsTree,
		children: [ ...commentsTree.children, initialComment.ID ],
	};
};

const omitCommentsFromTree = ( commentsTree, commentIds ) => {
	if ( ! commentIds.length ) {
		return commentsTree;
	}

	const omittedIds = new Set( commentIds.map( String ) );
	const isVisible = ( commentId ) => ! omittedIds.has( String( commentId ) );

	return Object.fromEntries(
		Object.entries( commentsTree )
			.filter( ( [ key ] ) => isVisible( key ) )
			.map( ( [ key, node ] ) =>
				key === 'children'
					? [ key, node.filter( isVisible ) ]
					: [ key, { ...node, children: node.children.filter( isVisible ) } ]
			)
	);
};

export const usePostCommentsData = ( props ) => {
	const dispatch = useDispatch();
	const [ activeReplyCommentId, setActiveReplyCommentId ] = useState( null );
	const [ isExpanded, setIsExpanded ] = useState( false );
	const [ pendingCommentIds, setPendingCommentIds ] = useState( [] );
	const currentUserId = useSelector( getCurrentUserId );
	const siteId = props.post?.site_ID;
	const postId = props.post?.ID;
	const canUserModerateComments = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'moderate_comments' )
	);

	useEffect( () => {
		if ( ! siteId || ! postId ) {
			return;
		}

		setActiveReplyCommentId( null );
		setIsExpanded( false );
		setPendingCommentIds( [] );
	}, [ siteId, postId, props.streamKey ] );

	const {
		comments: loadedComments,
		commentsFetchingStatus,
		fetchEarlierComments,
		fetchLaterComments,
		data,
	} = useComments( {
		siteId,
		postId,
		status: props.commentsFilter,
		displayStatus: props.commentsFilterDisplay ?? props.commentsFilter,
		commentTotal: props.commentCount,
		authorId: currentUserId,
	} );
	const { deferNewComments } = props;

	const pollForNewComments = useCallback( async () => {
		if ( ! deferNewComments ) {
			return fetchLaterComments();
		}

		const knownIds = new Set( loadedComments.map( ( comment ) => comment.ID ) );
		const { data: polled } = await fetchLaterComments();
		const newIds = ( polled?.pages ?? [] )
			.flatMap( ( page ) => page.comments )
			.filter(
				( comment ) =>
					! knownIds.has( comment.ID ) &&
					! comment.isPlaceholder &&
					comment.author?.ID !== currentUserId
			)
			.map( ( comment ) => comment.ID );

		setPendingCommentIds( ( current ) => [ ...new Set( [ ...current, ...newIds ] ) ] );
	}, [ currentUserId, deferNewComments, fetchLaterComments, loadedComments ] );

	const initialCommentFromList = props.startingCommentId
		? loadedComments.find(
				( comment ) => Number( comment.ID ) === Number( props.startingCommentId )
			)
		: undefined;
	const shouldFetchStartingComment = Boolean(
		data && props.startingCommentId && ! initialCommentFromList
	);
	const startingComment = useComment(
		{
			siteId,
			commentId: props.startingCommentId,
		},
		{ enabled: shouldFetchStartingComment }
	);
	const additionalComments = useMemo(
		() =>
			startingComment.data &&
			( startingComment.data.post?.ID === postId || ! startingComment.data.post )
				? [ startingComment.data ]
				: [],
		[ postId, startingComment.data ]
	);
	const commentsForDisplay = useMemo(
		() => mergeCommentLists( loadedComments, additionalComments ),
		[ additionalComments, loadedComments ]
	);
	const commentsTree = useMemo(
		() =>
			buildCommentsTreeForDisplay( {
				comments: commentsForDisplay,
				displayStatus: props.commentsFilterDisplay ?? props.commentsFilter,
				authorId: currentUserId,
			} ),
		[ commentsForDisplay, currentUserId, props.commentsFilter, props.commentsFilterDisplay ]
	);
	const initialComment = props.startingCommentId
		? commentsForDisplay.find(
				( comment ) => Number( comment.ID ) === Number( props.startingCommentId )
			)
		: undefined;
	const commentsTreeWithInitialComment = useMemo(
		() => ensureInitialCommentVisible( commentsTree, initialComment ),
		[ commentsTree, initialComment ]
	);
	// Replies whose parent isn't loaded never render, so they aren't counted as updates.
	const reachablePendingIds = useMemo( () => {
		if ( ! pendingCommentIds.length ) {
			return pendingCommentIds;
		}

		const reachableIds = new Set();
		const visit = ( commentIds ) =>
			commentIds.forEach( ( commentId ) => {
				reachableIds.add( String( commentId ) );
				visit( commentsTreeWithInitialComment[ commentId ]?.children ?? [] );
			} );
		visit( commentsTreeWithInitialComment.children );

		return pendingCommentIds.filter( ( commentId ) => reachableIds.has( String( commentId ) ) );
	}, [ commentsTreeWithInitialComment, pendingCommentIds ] );
	const visibleCommentsTree = useMemo(
		() => omitCommentsFromTree( commentsTreeWithInitialComment, pendingCommentIds ),
		[ commentsTreeWithInitialComment, pendingCommentIds ]
	);

	return {
		siteId,
		postId,
		currentUserId,
		canUserModerateComments,
		comments: commentsForDisplay,
		commentsTree: visibleCommentsTree,
		commentsFetchingStatus,
		initialComment,
		isInitialCommentLoading: shouldFetchStartingComment && startingComment.isLoading,
		activeReplyCommentId,
		isExpanded,
		fetchEarlierComments,
		fetchLaterComments,
		pollForNewComments,
		pendingCommentIds: reachablePendingIds,
		revealPendingComments: () => setPendingCommentIds( [] ),
		setActiveReply: ( { commentId } ) => setActiveReplyCommentId( commentId ),
		toggleInlineCommentsExpanded: () => setIsExpanded( ( current ) => ! current ),
		recordReaderTracksEvent: ( ...args ) => dispatch( recordReaderTracksEvent( ...args ) ),
	};
};
