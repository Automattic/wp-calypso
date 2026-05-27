import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment, useEffect, useMemo, useState } from 'react';
import { Interval, EVERY_MINUTE } from 'calypso/lib/interval';
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
import PostCommentsList from './post-comment-list';

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

class PostComments extends Component {
	static propTypes = {
		shouldHighlightNew: PropTypes.bool,
		post: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			site_ID: PropTypes.number.isRequired,
		} ).isRequired,
	};

	static defaultProps = {
		shouldHighlightNew: false,
		shouldPollForNewComments: false,
	};

	pollForNewComments = () => {
		this.props.fetchLaterComments();
	};

	render() {
		const { siteId, postId, shouldPollForNewComments } = this.props;

		if ( ! siteId || ! postId ) {
			return null;
		}

		return (
			<Fragment>
				{ shouldPollForNewComments && (
					<Interval onTick={ this.pollForNewComments } period={ EVERY_MINUTE } />
				) }
				<PostCommentsList { ...this.props } />
			</Fragment>
		);
	}
}

const PostCommentsWithData = ( props ) => {
	const dispatch = useDispatch();
	const [ activeReplyCommentId, setActiveReplyCommentId ] = useState( null );
	const [ isExpanded, setIsExpanded ] = useState( false );
	const currentUserId = useSelector( getCurrentUserId );
	const siteId = props.post.site_ID;
	const postId = props.post.ID;
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

	const comments = useComments( {
		siteId,
		postId,
		status: props.commentsFilter,
		displayStatus: props.commentsFilterDisplay ?? props.commentsFilter,
		commentTotal: props.commentCount,
		authorId: currentUserId,
	} );
	const initialCommentFromList = props.startingCommentId
		? comments.comments.find(
				( comment ) => Number( comment.ID ) === Number( props.startingCommentId )
		  )
		: undefined;
	const shouldFetchStartingComment = Boolean(
		comments.data && props.startingCommentId && ! initialCommentFromList
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
		() => mergeCommentLists( comments.comments, additionalComments ),
		[ additionalComments, comments.comments ]
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

	if ( ! siteId || ! postId ) {
		return null;
	}

	return (
		<PostComments
			{ ...props }
			siteId={ siteId }
			postId={ postId }
			currentUserId={ currentUserId }
			canUserModerateComments={ canUserModerateComments }
			comments={ commentsForDisplay }
			commentsTree={ commentsTreeWithInitialComment }
			commentsFetchingStatus={ comments.commentsFetchingStatus }
			initialComment={ initialComment }
			isInitialCommentLoading={ shouldFetchStartingComment && startingComment.isLoading }
			activeReplyCommentId={ activeReplyCommentId }
			isExpanded={ isExpanded }
			fetchEarlierComments={ comments.fetchEarlierComments }
			fetchLaterComments={ comments.fetchLaterComments }
			setActiveReply={ ( { commentId } ) => setActiveReplyCommentId( commentId ) }
			toggleInlineCommentsExpanded={ () => setIsExpanded( ( current ) => ! current ) }
			recordReaderTracksEvent={ ( ...args ) => dispatch( recordReaderTracksEvent( ...args ) ) }
		/>
	);
};

export default localize( PostCommentsWithData );
