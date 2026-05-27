import { useEffect, useMemo, useState } from 'react';
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

export const usePostCommentsData = ( props ) => {
	const dispatch = useDispatch();
	const [ activeReplyCommentId, setActiveReplyCommentId ] = useState( null );
	const [ isExpanded, setIsExpanded ] = useState( false );
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

	return {
		siteId,
		postId,
		currentUserId,
		canUserModerateComments,
		comments: commentsForDisplay,
		commentsTree: commentsTreeWithInitialComment,
		commentsFetchingStatus,
		initialComment,
		isInitialCommentLoading: shouldFetchStartingComment && startingComment.isLoading,
		activeReplyCommentId,
		isExpanded,
		fetchEarlierComments,
		fetchLaterComments,
		setActiveReply: ( { commentId } ) => setActiveReplyCommentId( commentId ),
		toggleInlineCommentsExpanded: () => setIsExpanded( ( current ) => ! current ),
		recordReaderTracksEvent: ( ...args ) => dispatch( recordReaderTracksEvent( ...args ) ),
	};
};
