import { Button, Gridicon, SegmentedControl } from '@automattic/components';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { get, size, delay, pickBy } from 'lodash';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import { connect } from 'react-redux';
import ConversationFollowButton from 'calypso/blocks/conversation-follow-button';
import { shouldShowConversationFollowButton } from 'calypso/blocks/conversation-follow-button/helper';
import ReaderFollowConversationIcon from 'calypso/reader/components/icons/follow-conversation-icon';
import ReaderFollowingConversationIcon from 'calypso/reader/components/icons/following-conversation-icon';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';
import {
	requestPostComments,
	requestComment,
	setActiveReply,
	toggleInlineCommentsExpanded,
} from 'calypso/state/comments/actions';
import { NUMBER_OF_COMMENTS_PER_FETCH } from 'calypso/state/comments/constants';
import {
	commentsFetchingStatus,
	getActiveReplyCommentId,
	getCommentById,
	getPostCommentsTree,
	getInlineCommentsExpandedState,
} from 'calypso/state/comments/selectors';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import CommentCount from './comment-count';
import PostCommentFormRoot from './form-root';
import PostComment from './post-comment';

import './post-comment-list.scss';

/**
 * PostCommentList displays a list of comments for a post.
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

class PostCommentList extends Component {
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
		fixedHeaderHeight: PropTypes.number,
		streamKey: PropTypes.string,

		// To show only the most recent comment by default, and allow expanding to see the longer
		// list.
		expandableView: PropTypes.bool,
		openPostPageAtComments: PropTypes.func,

		// To display comments with a different status but not fetch them
		// e.g. Reader full post view showing unapproved comments made to a moderated site
		commentsFilterDisplay: PropTypes.string,

		// connect()ed props:
		commentsTree: PropTypes.object,
		requestPostComments: PropTypes.func.isRequired,
		requestComment: PropTypes.func.isRequired,
		shouldHighlightNew: PropTypes.bool,
	};

	static defaultProps = {
		shouldHighlightNew: false,
		pageSize: NUMBER_OF_COMMENTS_PER_FETCH,
		initialSize: NUMBER_OF_COMMENTS_PER_FETCH,
		showCommentCount: true,
		maxDepth: Infinity,
		showNestingReplyArrow: false,
		showConversationFollowButton: false,
		expandableView: false,
	};

	constructor( props ) {
		super( props );
		this.listRef = createRef();
	}

	state = {
		amountOfCommentsToTake: this.props.initialSize,
		commentText: '',
		showExpandWhenOnlyComments: false,
	};

	shouldFetchInitialComment = () => {
		const { startingCommentId, initialComment } = this.props;
		return !! ( startingCommentId && ! initialComment );
	};

	shouldFetchInitialPages = () => {
		const { startingCommentId, commentsTree } = this.props;

		return (
			startingCommentId &&
			commentsTree[ startingCommentId ] &&
			this.props.commentsTree[ startingCommentId ] &&
			! this.alreadyLoadedInitialSet
		);
	};

	shouldNormalFetchAfterPropsChange = () => {
		// this next check essentially looks out for whether we've ever requested comments for the post
		if (
			this.props.commentsFetchingStatus.haveEarlierCommentsToFetch &&
			this.props.commentsFetchingStatus.haveLaterCommentsToFetch
		) {
			return true;
		}

		const currentSiteId = get( this.props, 'post.site_ID' );
		const currentPostId = get( this.props, 'post.ID' );
		const currentCommentsFilter = this.props.commentsFilter;
		const currentInitialComment = this.props.initialComment;

		const nextSiteId = get( this.props, 'post.site_ID' );
		const nextPostId = get( this.props, 'post.ID' );
		const nextCommentsFilter = this.props.commentsFilter;
		const nextInitialComment = this.props.initialComment;

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

	initialFetches = () => {
		const { postId, siteId, commentsFilter: status } = this.props;

		if ( this.shouldFetchInitialComment() ) {
			// there is an edgecase the initialComment can change while on the same post
			// in this case we can't just load the exact comment in question because
			// we could create a gap in the list.
			if ( this.props.commentsTree ) {
				// view earlier...
				this.viewEarlierCommentsHandler();
			} else {
				this.props.requestComment( { siteId, commentId: this.props.startingCommentId } );
			}
		} else if ( this.shouldFetchInitialPages() ) {
			this.viewEarlierCommentsHandler();
			this.viewLaterCommentsHandler();
			this.alreadyLoadedInitialSet = true;
		} else if ( this.shouldNormalFetchAfterPropsChange() ) {
			this.props.requestPostComments( { siteId, postId, status } );
		}
	};

	componentDidMount() {
		this.initialFetches();
		this.scrollWhenDOMReady();
		this.resetActiveReplyComment();
		this.checkForClampedComments();
	}

	componentDidUpdate( prevProps, prevState ) {
		// If only the state is changing, do nothing. (Avoids setState loops.)
		if ( prevState !== this.state && prevProps === this.props ) {
			return;
		}
		this.initialFetches();
		if (
			prevProps.siteId !== this.props.siteId ||
			prevProps.postId !== this.props.postId ||
			prevProps.startingCommentId !== this.props.startingCommentId
		) {
			this.hasScrolledToComment = false;
			this.scrollWhenDOMReady();
		}

		if (
			// The view is not expanded and has just been collapsed or the amount of comments have changed.
			// Note more safety conditions are contained generally in checkForClampedComments.
			! this.props.isExpanded &&
			( prevProps.isExpanded ||
				Object.keys( prevProps.commentsTree ).length !==
					Object.keys( this.props.commentsTree ).length )
		) {
			this.checkForClampedComments();
		}
	}

	checkForClampedComments = () => {
		if (
			// This check isnt necessary if we arent in expandableView or are expanded.
			! this.props.expandableView ||
			this.props.isExpanded ||
			// Bail early if there is no listRef to query.
			! this.listRef.current ||
			// Bail early if this state is already flagged, avoids setState loops in methods like
			// componentDidUpdate.
			this.state.showExpandWhenOnlyComments
		) {
			return;
		}

		// Query selector ALL since we might be showing the readers reply as well.
		const commentContentEles = this.listRef.current.querySelectorAll(
			'.comments__comment-content'
		);
		let isClampedComment = false;

		// Check if either the comment or reply that might be shown are line clamped.
		commentContentEles.forEach( ( comment ) => {
			if ( comment.scrollHeight > comment.clientHeight ) {
				isClampedComment = true;
			}
		} );

		// There is no need to set false, as it already is false if this is running.
		if ( isClampedComment ) {
			this.setState( { showExpandWhenOnlyComments: true } );
		}
	};

	commentIsOnDOM = ( commentId ) => !! window.document.getElementById( `comment-${ commentId }` );

	scrollWhenDOMReady = () => {
		if ( this.props.startingCommentId && ! this.hasScrolledToComment ) {
			if ( this.commentIsOnDOM( this.props.startingCommentId ) ) {
				delay( () => this.scrollToComment(), 50 );
			}
			delay( this.scrollWhenDOMReady, 100 );
		}
	};

	renderComment = ( commentId, commentsTree ) => {
		if ( ! commentId ) {
			return null;
		}

		return (
			<PostComment
				post={ this.props.post }
				commentsTree={ commentsTree }
				commentId={ commentId }
				key={ commentId }
				activeReplyCommentId={ this.props.activeReplyCommentId }
				onReplyClick={ this.onReplyClick }
				onReplyCancel={ this.onReplyCancel }
				commentText={ this.state.commentText }
				onUpdateCommentText={ this.onUpdateCommentText }
				onCommentSubmit={ this.resetActiveReplyComment }
				depth={ 0 }
				maxDepth={ this.props.maxDepth }
				showNestingReplyArrow={ this.props.showNestingReplyArrow }
				shouldHighlightNew={ this.props.shouldHighlightNew }
				isInlineComment={ this.props.expandableView }
			/>
		);
	};

	renderCommentManageLink = () => {
		const { siteId, postId } = this.props;

		if ( ! siteId || ! postId ) {
			return null;
		}

		return (
			<Button
				className="comments__manage-comments-button"
				href={ `/comments/all/${ siteId }/${ postId }` }
				borderless
			>
				<Gridicon icon="chat" />
				<span>{ translate( 'Manage comments' ) }</span>
			</Button>
		);
	};

	onReplyClick = ( commentId ) => {
		this.setActiveReplyComment( commentId );
		recordAction( 'comment_reply_click' );
		recordGaEvent( 'Clicked Reply to Comment' );
		this.props.recordReaderTracksEvent(
			'calypso_reader_comment_reply_click',
			{
				comment_id: commentId,
				is_inline_comment: this.props.expandableView,
			},
			{ post: this.props.post }
		);
	};

	onReplyCancel = () => {
		this.setState( { commentText: null } );
		recordAction( 'comment_reply_cancel_click' );
		recordGaEvent( 'Clicked Cancel Reply to Comment' );
		this.props.recordReaderTracksEvent(
			'calypso_reader_comment_reply_cancel_click',
			{
				comment_id: this.props.activeReplyCommentId,
				is_inline_comment: this.props.expandableView,
			},
			{ post: this.props.post }
		);
		this.resetActiveReplyComment();
	};

	onOpenPostPageAtComments = () => {
		if ( ! this.props.openPostPageAtComments ) {
			return;
		}
		return this.props.openPostPageAtComments();
	};

	onUpdateCommentText = ( commentText ) => {
		this.setState( { commentText: commentText } );
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

	toggleExpanded = ( ev ) => {
		if ( this.props.expandableView ) {
			ev.stopPropagation();

			if ( ! this.props.isExpanded ) {
				recordAction( 'click_inline_comments_expand' );
				recordGaEvent( 'Clicked Inline Comments Expand' );
				recordTrackForPost( 'calypso_reader_inline_comments_expand_click', this.props.post );
			} else {
				this.maybeScrollToListTop();
			}

			this.props.toggleInlineCommentsExpanded( {
				streamKey: this.props.streamKey,
				siteId: this.props.siteId,
				postId: this.props.postId,
			} );
		}
	};

	maybeScrollToListTop = () => {
		if ( this.listRef.current ) {
			const listEle = this.listRef.current;
			const rect = listEle.getBoundingClientRect();
			const visualCutoff = this.props.fixedHeaderHeight || 0;
			if ( rect.top < visualCutoff ) {
				listEle.scrollIntoView( true );
				window.scrollBy( 0, -1 * visualCutoff );
			}
		}
	};

	renderCommentsList = (
		commentIds,
		displayedCommentsCount,
		actualCommentsCount,
		// In many cases commentsTreeToShow === commentsTreeAvailable. For inline comments in
		// collapsed view: commentsTreeToShow represents the tree shown in the collapsed view, while
		// commentsTreeAvailable represents the comments tree available for expanded view.
		commentsTreeToShow,
		commentsTreeAvailable
	) => {
		// Comments in trees may be less than actualCommentCount since we may filter pingbacks out of
		// the tree. We need to use commentsTreeAvailable to determine whether to show
		// expand/collapse toggle for inline comments, but actualCommentsCount to determine whether
		// to show the link to view all comments (including pingbacks) on the post page.
		const shouldShowViewMoreToggle =
			this.props.expandableView &&
			( displayedCommentsCount < this.getCommentsCount( commentsTreeAvailable.children ) ||
				this.props.isExpanded );
		const shouldShowLinkToFullPost =
			this.props.expandableView &&
			( this.props.isExpanded || ! shouldShowViewMoreToggle ) &&
			displayedCommentsCount < actualCommentsCount;

		const viewMoreText =
			! shouldShowViewMoreToggle && this.state.showExpandWhenOnlyComments
				? translate( 'Show more' )
				: translate( 'Show more comments' );

		let viewFewerText = translate( 'Show fewer comments' );
		if ( this.props.isExpanded ) {
			const { displayedCommentsCount: collapsedDisplayedCommentsCount } =
				this.getDisplayedCollapsedInlineComments( commentsTreeToShow );

			// If collapsing will not reduce the number of comments shown (only line-clamp them
			// visually), display 'View less' instead of 'View fewer comments'.
			if ( displayedCommentsCount === collapsedDisplayedCommentsCount ) {
				viewFewerText = translate( 'Show less' );
			}
		}

		return (
			<>
				<ol className="comments__list is-root">
					{ commentIds
						// Reverse comment list so that newest comments are rendered first.
						?.reverse()
						.map( ( commentId ) => this.renderComment( commentId, commentsTreeToShow ) ) }
				</ol>
				{ ( shouldShowViewMoreToggle || this.state.showExpandWhenOnlyComments ) && (
					<Button
						compact
						borderless
						className="comments__toggle-expand"
						onClick={ this.toggleExpanded }
					>
						{ this.props.isExpanded ? viewFewerText : viewMoreText }
					</Button>
				) }
				{ shouldShowLinkToFullPost && (
					<Button
						compact
						borderless
						className="comments__open-post"
						onClick={ this.onOpenPostPageAtComments }
					>
						{ shouldShowViewMoreToggle && '• ' }
						{ translate( 'View more comments on the full post' ) }
					</Button>
				) }
			</>
		);
	};

	scrollToComment = () => {
		const comment = window.document.getElementById( window.location.hash.substring( 1 ) );
		if ( ! comment ) {
			return;
		}
		comment.scrollIntoView();
		window.scrollBy( 0, -50 );
		this.hasScrolledToComment = true;
	};

	getCommentsCount = ( commentIds ) => {
		// we always count prevSum, children sum, and +1 for the current processed comment
		return commentIds.reduce(
			( prevSum, commentId ) =>
				prevSum +
				this.getCommentsCount( get( this.props.commentsTree, [ commentId, 'children' ] ) ) +
				1,
			0
		);
	};

	/**
	 * Gets comments for display
	 * @param {Array<number>} commentIds The top level commentIds to take from
	 * @param {number} numberToTake How many top level comments to take
	 * @returns {Object} that has the displayed comments + total displayed count including children
	 */
	getDisplayedComments = ( commentIds, numberToTake ) => {
		if ( ! commentIds ) {
			return null;
		}

		const displayedComments = numberToTake ? commentIds.slice( numberToTake * -1 ) : [];

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

	loadMoreCommentsHandler = ( direction ) => {
		const {
			post: { ID: postId, site_ID: siteId },
			commentsFilter: status,
		} = this.props;
		const amountOfCommentsToTake = this.state.amountOfCommentsToTake + this.props.pageSize;

		this.setState( { amountOfCommentsToTake } );
		this.props.requestPostComments( { siteId, postId, status, direction } );
	};

	handleFilterClick = ( commentsFilter ) => () => this.props.onFilterChange( commentsFilter );

	getDisplayedCollapsedInlineComments = ( commentsTree ) => {
		// Only take the most recent comment.
		const lastCommentArr = commentsTree.children.slice( -1 );
		const lastComment = lastCommentArr[ 0 ];

		if ( ! lastComment ) {
			return {
				displayedComments: [],
				displayedCommentsCount: 0,
				commentsTreeToUse: commentsTree,
			};
		}

		// Setup a new comment tree to customize replies rendered.
		const newCommentTree = { children: lastCommentArr };
		newCommentTree[ lastComment ] = {
			data: commentsTree[ lastComment ]?.data,
			children: [],
		};

		// Go through the children of the last comment to find replies by the current user.
		const authorReplies = commentsTree[ lastComment ]?.children.filter( ( replyId ) => {
			return commentsTree[ replyId ]?.data.author?.ID === this.props.currentUserId;
		} );

		// Add the latest reply of the current user to the comments children array and comment tree.
		if ( authorReplies?.length ) {
			const lastReply = authorReplies.pop();
			newCommentTree[ lastComment ].children.push( lastReply );
			newCommentTree[ lastReply ] = {
				data: commentsTree[ lastReply ].data,
				// Ensure no children since this is the last reply we want rendered.
				children: [],
			};
		}

		return {
			displayedComments: lastCommentArr,
			// We will show all comments in the newCommentTree, subtract 1 for the children array.
			displayedCommentsCount: Object.keys( newCommentTree ).length - 1,
			commentsTreeToUse: newCommentTree,
		};
	};

	removePingAndTrackbacks = ( commentsTree ) => {
		const newTree = pickBy(
			commentsTree,
			( comment ) =>
				comment.data && comment.data.type !== 'pingback' && comment.data.type !== 'trackback'
		);
		// Ensure we add the new children array.
		newTree.children = commentsTree.children.filter( ( commentId ) => newTree[ commentId ] );
		return newTree;
	};

	render() {
		if ( ! this.props.commentsTree ) {
			return null;
		}

		const {
			post: { ID: postId, site_ID: siteId },
			commentsFilter,
			showFilters,
			commentCount,
			followSource,
			expandableView,
		} = this.props;

		const shouldShowFilters = showFilters && ! expandableView;

		const commentsTree = expandableView
			? this.removePingAndTrackbacks( this.props.commentsTree )
			: this.props.commentsTree;

		const { haveEarlierCommentsToFetch, haveLaterCommentsToFetch } =
			this.props.commentsFetchingStatus;

		const amountOfCommentsToTake = this.props.startingCommentId
			? Infinity
			: this.state.amountOfCommentsToTake;

		const isCollapsedInline = expandableView && ! this.props.isExpanded;

		const {
			displayedComments,
			displayedCommentsCount,
			commentsTreeToUse = commentsTree,
		} = isCollapsedInline
			? this.getDisplayedCollapsedInlineComments( commentsTree )
			: this.getDisplayedComments( commentsTree.children, amountOfCommentsToTake );

		// Note: we might show fewer comments than commentsCount because some comments might be
		// orphans (parent deleted/unapproved), that comment will become unreachable but still counted.
		const showViewMoreComments =
			! this.props.expandableView &&
			( size( commentsTree.children ) > amountOfCommentsToTake ||
				haveEarlierCommentsToFetch ||
				haveLaterCommentsToFetch ) &&
			displayedCommentsCount > 0;

		// If we're not yet fetched all comments from server, we can only rely on server's count.
		// once we got all the comments tree, we can calculate the count of reachable comments
		const actualCommentsCount =
			haveEarlierCommentsToFetch || haveLaterCommentsToFetch
				? commentCount
				: // Use commentsTree on props since 'commentsTree' var here may have pingbacks
				  // filtered out above.
				  this.getCommentsCount( this.props.commentsTree.children );

		const showConversationFollowButton =
			this.props.showConversationFollowButton &&
			shouldShowConversationFollowButton( this.props.post );

		const showManageCommentsButton =
			! expandableView && this.props.canUserModerateComments && commentCount > 0;

		return (
			<div
				className={ clsx( 'comments__comment-list', {
					'has-double-actions': showManageCommentsButton && showConversationFollowButton,
					'is-inline': expandableView,
					'is-collapsed': isCollapsedInline,
				} ) }
				ref={ this.listRef }
			>
				{ ( this.props.showCommentCount ||
					showManageCommentsButton ||
					showConversationFollowButton ) && (
					<div className="comments__info-bar">
						<div className="comments__info-bar-title-links">
							{ this.props.showCommentCount && <CommentCount count={ actualCommentsCount } /> }
							<div className="comments__actions-wrapper">
								{ showManageCommentsButton && this.renderCommentManageLink() }
								{ showConversationFollowButton && (
									<ConversationFollowButton
										className="comments__conversation-follow-button"
										siteId={ siteId }
										postId={ postId }
										post={ this.props.post }
										followSource={ followSource }
										followIcon={ ReaderFollowConversationIcon( { iconSize: 24 } ) }
										followingIcon={ ReaderFollowingConversationIcon( { iconSize: 24 } ) }
									/>
								) }
							</div>
						</div>
					</div>
				) }
				<PostCommentFormRoot
					post={ this.props.post }
					commentsTree={ commentsTreeToUse }
					commentText={ this.state.commentText }
					onUpdateCommentText={ this.onUpdateCommentText }
					activeReplyCommentId={ this.props.activeReplyCommentId }
					isInlineComment={ this.props.expandableView }
				/>
				{ shouldShowFilters && (
					<SegmentedControl compact primary>
						<SegmentedControl.Item
							selected={ commentsFilter === 'all' }
							onClick={ this.handleFilterClick( 'all' ) }
						>
							{ translate( 'All' ) }
						</SegmentedControl.Item>
						<SegmentedControl.Item
							selected={ commentsFilter === 'approved' }
							onClick={ this.handleFilterClick( 'approved' ) }
						>
							{ translate( 'Approved', { context: 'comment status' } ) }
						</SegmentedControl.Item>
						<SegmentedControl.Item
							selected={ commentsFilter === 'unapproved' }
							onClick={ this.handleFilterClick( 'unapproved' ) }
						>
							{ translate( 'Pending', { context: 'comment status' } ) }
						</SegmentedControl.Item>
						<SegmentedControl.Item
							selected={ commentsFilter === 'spam' }
							onClick={ this.handleFilterClick( 'spam' ) }
						>
							{ translate( 'Spam', { context: 'comment status' } ) }
						</SegmentedControl.Item>
						<SegmentedControl.Item
							selected={ commentsFilter === 'trash' }
							onClick={ this.handleFilterClick( 'trash' ) }
						>
							{ translate( 'Trash', { context: 'comment status' } ) }
						</SegmentedControl.Item>
					</SegmentedControl>
				) }
				{ showViewMoreComments && this.props.startingCommentId && (
					<button className="comments__view-more" onClick={ this.viewLaterCommentsHandler }>
						{ translate( 'Load more comments (Showing %(shown)d of %(total)d)', {
							args: {
								shown: displayedCommentsCount,
								total: actualCommentsCount,
							},
						} ) }
					</button>
				) }
				{ this.renderCommentsList(
					displayedComments,
					displayedCommentsCount,
					actualCommentsCount,
					commentsTreeToUse,
					commentsTree
				) }
				{ showViewMoreComments && (
					<button
						className="comments__view-more comments__view-more-last"
						onClick={ this.viewEarlierCommentsHandler }
					>
						{ translate( 'Load more comments (Showing %(shown)d of %(total)d)', {
							args: {
								shown: displayedCommentsCount,
								total: actualCommentsCount,
							},
						} ) }
					</button>
				) }
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
			currentUserId: authorId,
			canUserModerateComments: canCurrentUser( state, siteId, 'moderate_comments' ),
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
			isExpanded: getInlineCommentsExpandedState( state, ownProps.streamKey, siteId, postId ),
		};
	},
	{
		requestComment,
		requestPostComments,
		recordReaderTracksEvent,
		setActiveReply,
		toggleInlineCommentsExpanded,
	}
)( PostCommentList );
