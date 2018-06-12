/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';
import { get, size, takeRight, delay } from 'lodash';

/**
 * Internal dependencies
 */
import getActiveReplyCommentId from 'state/selectors/get-active-reply-comment-id';
import {
	getPostCommentsTree,
	commentsFetchingStatus,
	getCommentById,
} from 'state/comments/selectors';
import { requestPostComments, requestComment, setActiveReply } from 'state/comments/actions';
import { NUMBER_OF_COMMENTS_PER_FETCH } from 'state/comments/constants';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import PostComment from './post-comment';
import PostCommentFormRoot from './form-root';
import CommentCount from './comment-count';
import SegmentedControl from 'components/segmented-control';
import SegmentedControlItem from 'components/segmented-control/item';
import ConversationFollowButton from 'blocks/conversation-follow-button';
import { shouldShowConversationFollowButton } from 'blocks/conversation-follow-button/helper';
import { getCurrentUserId } from 'state/current-user/selectors';

/**
 * PostCommentList, as the name would suggest, displays a list of comments for a post.
 * It has the capability of either starting from the latest comment for a post,
 * or it may begin from any commentId within the post by specifying a commentId.
 *
 * Depending on where the list starts, there is slightly different behavior:
 * 1. from the last comments:
 *    this is the simplest case. Initially onMount we request the latest comments
 *    and only display a subset of them.  When the user clicks "Show More" we load more comments
 *
 * 2. from a specific commentId:
 *    this is activated by specifying the commentId prop. onMount we request the specific comment and then
 *    also a page before it / a page after it.  Then we scroll down to the specific comment.
 *    This also activates a "Show More" button at the end of the comment list instead of just at the top
 *
 */
class PostCommentList extends React.Component {
	static propTypes = {
		post: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			site_ID: PropTypes.number.isRequired,
		} ).isRequired,
		pageSize: PropTypes.number,
		initialSize: PropTypes.number,
		showCommentCount: PropTypes.bool,
		startingCommentId: PropTypes.number,
		commentCount: PropTypes.number,
		maxDepth: PropTypes.number,
		showNestingReplyArrow: PropTypes.bool,
		showConversationFollowButton: PropTypes.bool,
		commentsFilter: PropTypes.string,
		followSource: PropTypes.string,

		// To display comments with a different status but not fetch them
		// e.g. Reader full post view showing unapproved comments made to a moderated site
		commentsFilterDisplay: PropTypes.string,

		// connect()ed props:
		commentsTree: PropTypes.object,
		requestPostComments: PropTypes.func.isRequired,
		requestComment: PropTypes.func.isRequired,
	};

	static defaultProps = {
		pageSize: NUMBER_OF_COMMENTS_PER_FETCH,
		initialSize: NUMBER_OF_COMMENTS_PER_FETCH,
		showCommentCount: true,
		maxDepth: Infinity,
		showNestingReplyArrow: false,
		showConversationFollowButton: false,
	};

	state = {
		amountOfCommentsToTake: this.props.initialSize,
		commentsFilter: 'all',
		activeEditCommentId: null,
	};

	shouldFetchInitialComment = ( { startingCommentId, initialComment } ) => {
		return !! ( startingCommentId && ! initialComment );
	};

	shouldFetchInitialPages = ( { startingCommentId, commentsTree } ) =>
		startingCommentId &&
		commentsTree[ startingCommentId ] &&
		this.props.commentsTree[ startingCommentId ] &&
		! this.alreadyLoadedInitialSet;

	shouldNormalFetchAfterPropsChange = nextProps => {
		// this next check essentially looks out for whether we've ever requested comments for the post
		if (
			nextProps.commentsFetchingStatus.haveEarlierCommentsToFetch &&
			nextProps.commentsFetchingStatus.haveLaterCommentsToFetch
		) {
			return true;
		}

		const currentSiteId = get( this.props, 'post.site_ID' );
		const currentPostId = get( this.props, 'post.ID' );
		const currentCommentsFilter = this.props.commentsFilter;
		const currentInitialComment = this.props.initialComment;

		const nextSiteId = get( nextProps, 'post.site_ID' );
		const nextPostId = get( nextProps, 'post.ID' );
		const nextCommentsFilter = nextProps.commentsFilter;
		const nextInitialComment = nextProps.initialComment;

		const propsExist = nextSiteId && nextPostId && nextCommentsFilter;
		const propChanged =
			currentSiteId !== nextSiteId ||
			currentPostId !== nextPostId ||
			currentCommentsFilter !== nextCommentsFilter;

		/**
		 * This covers two cases where fetching by commentId fails and we should fetch as if it werent specified:
		 *  1. the comment specified (commentId) exists for the site but is for a different postId
		 *  2. the commentId does not exist for the site
		 */
		const commentIdBail =
			currentInitialComment !== nextInitialComment &&
			nextInitialComment &&
			( nextInitialComment.error ||
				( nextInitialComment.post && nextInitialComment.post.ID !== nextPostId ) );

		return ( propsExist && propChanged ) || commentIdBail;
	};

	initialFetches = ( props = this.props ) => {
		const { postId, siteId, commentsFilter: status } = props;

		if ( this.shouldFetchInitialComment( props ) ) {
			// there is an edgecase the initialComment can change while on the same post
			// in this case we can't just load the exact comment in question because
			// we could create a gap in the list.
			if ( this.props.commentsTree ) {
				this.viewEarlierCommentsHandler();
			} else {
				props.requestComment( { siteId, commentId: props.startingCommentId } );
			}
		} else if ( this.shouldFetchInitialPages( props ) ) {
			this.viewEarlierCommentsHandler();
			this.viewLaterCommentsHandler();
			this.alreadyLoadedInitialSet = true;
		} else if ( this.shouldNormalFetchAfterPropsChange( props ) ) {
			props.requestPostComments( { siteId, postId, status } );
		}
	};

	componentWillMount() {
		this.initialFetches();
		this.scrollWhenDOMReady();
	}

	componentDidMount() {
		this.resetActiveReplyComment();
	}

	componentWillReceiveProps( nextProps ) {
		this.initialFetches( nextProps );
		if (
			this.props.siteId !== nextProps.siteId ||
			this.props.postId !== nextProps.postId ||
			this.props.startingCommentId !== nextProps.startingCommentId
		) {
			this.hasScrolledToComment = false;
			this.scrollWhenDOMReady();
		}
	}

	commentIsOnDOM = commentId => !! window.document.getElementById( `comment-${ commentId }` );

	scrollWhenDOMReady = () => {
		if ( this.props.startingCommentId && ! this.hasScrolledToComment ) {
			if ( this.commentIsOnDOM( this.props.startingCommentId ) ) {
				delay( () => this.scrollToComment(), 50 );
			}
			delay( this.scrollWhenDOMReady, 100 );
		}
	};

	renderComment = commentId => {
		if ( ! commentId ) {
			return null;
		}

		// TODO Should not need to bind here
		const onEditCommentClick = this.onEditCommentClick.bind( this, commentId );

		return (
			<PostComment
				post={ this.props.post }
				commentsTree={ this.props.commentsTree }
				commentId={ commentId }
				key={ commentId }
				showModerationTools={ this.props.showModerationTools }
				activeEditCommentId={ this.state.activeEditCommentId }
				activeReplyCommentId={ this.props.activeReplyCommentId }
				onEditCommentClick={ onEditCommentClick }
				onEditCommentCancel={ this.onEditCommentCancel }
				onReplyClick={ this.onReplyClick }
				onReplyCancel={ this.onReplyCancel }
				commentText={ this.commentText }
				onUpdateCommentText={ this.onUpdateCommentText }
				onCommentSubmit={ this.resetActiveReplyComment }
				depth={ 0 }
				maxDepth={ this.props.maxDepth }
				showNestingReplyArrow={ this.props.showNestingReplyArrow }
			/>
		);
	};

	onEditCommentClick = commentId => {
		this.setState( { activeEditCommentId: commentId } );
	};

	onEditCommentCancel = () => this.setState( { activeEditCommentId: null } );

	onReplyClick = commentId => {
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
			comment_id: this.state.activeReplyCommentId,
		} );
		this.resetActiveReplyComment();
	};

	onUpdateCommentText = commentText => {
		this.setState( { commentText: commentText } );
	};

	setActiveReplyComment = commentId => {
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

	renderCommentsList = commentIds => {
		return (
			<ol className="comments__list is-root">
				{ commentIds.map( commentId => this.renderComment( commentId ) ) }
			</ol>
		);
	};

	scrollToComment = () => {
		const comment = window.document.getElementById( window.location.hash.substring( 1 ) );
		comment.scrollIntoView();
		window.scrollBy( 0, -50 );
		this.hasScrolledToComment = true;
	};

	getCommentsCount = commentIds => {
		// we always count prevSum, children sum, and +1 for the current processed comment
		return commentIds.reduce(
			( prevSum, commentId ) =>
				prevSum +
				this.getCommentsCount( get( this.props.commentsTree, [ commentId, 'children' ] ) ) +
				1,
			0
		);
	};

	/***
	 * Gets comments for display
	 * @param {Immutable.List<Number>} commentIds The top level commentIds to take from
	 * @param {Number} numberToTake How many top level comments to take
	 * @returns {Object} that has the displayed comments + total displayed count including children
	 */
	getDisplayedComments = ( commentIds, numberToTake ) => {
		if ( ! commentIds ) {
			return null;
		}

		const displayedComments = takeRight( commentIds, numberToTake );

		return {
			displayedComments,
			displayedCommentsCount: this.getCommentsCount( displayedComments ),
		};
	};

	viewEarlierCommentsHandler = () => {
		const direction = this.props.commentsFetchingStatus.haveEarlierCommentsToFetch
			? 'before'
			: 'after';
		this.loadMoreCommentsHandler( direction );
	};

	viewLaterCommentsHandler = () => {
		const direction = this.props.commentsFetchingStatus.haveLaterCommentsToFetch
			? 'after'
			: 'before';
		this.loadMoreCommentsHandler( direction );
	};

	loadMoreCommentsHandler = direction => {
		const {
			post: { ID: postId, site_ID: siteId },
			commentsFilter: status,
		} = this.props;
		const amountOfCommentsToTake = this.state.amountOfCommentsToTake + this.props.pageSize;

		this.setState( { amountOfCommentsToTake } );
		this.props.requestPostComments( { siteId, postId, status, direction } );
	};

	handleFilterClick = commentsFilter => () => this.props.onFilterChange( commentsFilter );

	render() {
		if ( ! this.props.commentsTree ) {
			return null;
		}

		const {
			post: { ID: postId, site_ID: siteId },
			commentsFilter,
			commentsTree,
			showFilters,
			commentCount,
			followSource,
		} = this.props;
		const {
			haveEarlierCommentsToFetch,
			haveLaterCommentsToFetch,
		} = this.props.commentsFetchingStatus;

		const amountOfCommentsToTake = !! this.props.startingCommentId
			? Infinity
			: this.state.amountOfCommentsToTake;

		const { displayedComments, displayedCommentsCount } = this.getDisplayedComments(
			commentsTree.children,
			amountOfCommentsToTake
		);

		// Note: we might show fewer comments than commentsCount because some comments might be
		// orphans (parent deleted/unapproved), that comment will become unreachable but still counted.
		const showViewMoreComments =
			size( commentsTree.children ) > amountOfCommentsToTake ||
			haveEarlierCommentsToFetch ||
			haveLaterCommentsToFetch;

		// If we're not yet fetched all comments from server, we can only rely on server's count.
		// once we got all the comments tree, we can calculate the count of reachable comments
		const actualCommentsCount =
			haveEarlierCommentsToFetch || haveLaterCommentsToFetch
				? commentCount
				: this.getCommentsCount( commentsTree.children );

		const showConversationFollowButton =
			this.props.showConversationFollowButton &&
			shouldShowConversationFollowButton( this.props.post );

		return (
			<div className="comments__comment-list">
				{ showConversationFollowButton && (
					<ConversationFollowButton
						className="comments__conversation-follow-button"
						siteId={ siteId }
						postId={ postId }
						post={ this.props.post }
						followSource={ followSource }
					/>
				) }
				{ ( this.props.showCommentCount || showViewMoreComments ) && (
					<div className="comments__info-bar">
						{ this.props.showCommentCount && <CommentCount count={ actualCommentsCount } /> }
						{ showViewMoreComments ? (
							<span className="comments__view-more" onClick={ this.viewEarlierCommentsHandler }>
								{ translate( 'Load more comments (Showing %(shown)d of %(total)d)', {
									args: {
										shown: displayedCommentsCount,
										total: actualCommentsCount,
									},
								} ) }
							</span>
						) : null }
					</div>
				) }
				{ showFilters && (
					<SegmentedControl compact primary>
						<SegmentedControlItem
							selected={ commentsFilter === 'all' }
							onClick={ this.handleFilterClick( 'all' ) }
						>
							{ translate( 'All' ) }
						</SegmentedControlItem>
						<SegmentedControlItem
							selected={ commentsFilter === 'approved' }
							onClick={ this.handleFilterClick( 'approved' ) }
						>
							{ translate( 'Approved', { context: 'comment status' } ) }
						</SegmentedControlItem>
						<SegmentedControlItem
							selected={ commentsFilter === 'unapproved' }
							onClick={ this.handleFilterClick( 'unapproved' ) }
						>
							{ translate( 'Pending', { context: 'comment status' } ) }
						</SegmentedControlItem>
						<SegmentedControlItem
							selected={ commentsFilter === 'spam' }
							onClick={ this.handleFilterClick( 'spam' ) }
						>
							{ translate( 'Spam', { context: 'comment status' } ) }
						</SegmentedControlItem>
						<SegmentedControlItem
							selected={ commentsFilter === 'trash' }
							onClick={ this.handleFilterClick( 'trash' ) }
						>
							{ translate( 'Trash', { context: 'comment status' } ) }
						</SegmentedControlItem>
					</SegmentedControl>
				) }
				{ this.renderCommentsList( displayedComments ) }
				{ showViewMoreComments &&
					this.props.startingCommentId && (
						<span className="comments__view-more" onClick={ this.viewLaterCommentsHandler }>
							{ translate( 'Load more comments (Showing %(shown)d of %(total)d)', {
								args: {
									shown: displayedCommentsCount,
									total: actualCommentsCount,
								},
							} ) }
						</span>
					) }
				<PostCommentFormRoot
					post={ this.props.post }
					commentsTree={ this.props.commentsTree }
					commentText={ this.state.commentText }
					onUpdateCommentText={ this.onUpdateCommentText }
					activeReplyCommentId={ this.props.activeReplyCommentId }
				/>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const authorId = getCurrentUserId( state );
		const siteId = ownProps.post.site_ID;
		const postId = ownProps.post.ID;

		return {
			siteId,
			postId,
			commentsTree: getPostCommentsTree(
				state,
				siteId,
				postId,
				ownProps.commentsFilterDisplay ? ownProps.commentsFilterDisplay : ownProps.commentsFilter,
				authorId
			),
			commentsFetchingStatus: commentsFetchingStatus(
				state,
				siteId,
				postId,
				ownProps.commentCount
			),
			initialComment: getCommentById( {
				state,
				siteId,
				commentId: ownProps.startingCommentId,
			} ),
			activeReplyCommentId: getActiveReplyCommentId( {
				state,
				siteId,
				postId,
			} ),
		};
	},
	{ requestPostComments, requestComment, setActiveReply }
)( PostCommentList );
