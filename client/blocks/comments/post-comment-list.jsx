/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { get, size, takeRight, delay } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CommentCount from './comment-count';
import PostCommentForm from './form';
import PostComment from './post-comment';
import SegmentedControl from 'components/segmented-control';
import SegmentedControlItem from 'components/segmented-control/item';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import { requestPostComments, requestComment } from 'state/comments/actions';
import { NUMBER_OF_COMMENTS_PER_FETCH } from 'state/comments/constants';
import { getPostCommentsTree, commentsFetchingStatus, getCommentById } from 'state/comments/selectors';

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
	};

	state = {
		activeReplyCommentId: null,
		amountOfCommentsToTake: this.props.initialSize,
		commentsFilter: 'all',
		activeEditCommentId: null,
	};

	/**
	 * Should we scroll down to a comment? Only if we have satisfied these conditions:
	 * 1. there is a startingCommentId
	 * 2. the comment has loaded and is on the DOM
	 * 3. we haven't already scrolled to it yet
	 * 4. we have loaded some comments above + below it already (or there is only 1 comment)
	 *
	 * @param {object} props - the propes to use when evaluating if window should be scrolled down to a comment.
	 * @returns {boolean} - whether or not we should scroll to a comment
	 */
	shouldScrollToComment = ( props = this.props ) => {
		return !! (
			props.startingCommentId &&
			props.commentsTree[ this.props.startingCommentId ] &&
			props.commentsFetchingStatus.hasReceivedBefore &&
			props.commentsFetchingStatus.hasReceivedAfter &&
			! this.hasScrolledToComment &&
			window.document.getElementById( `comment-${ props.startingCommentId }` )
		);
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

	componentWillMount() {
		const { post: { ID: postId, site_ID: siteId }, commentsFilter: status } = this.props;

		if ( this.shouldFetchInitialComment( this.props ) ) {
			this.props.requestComment( { siteId, commentId: this.props.startingCommentId } );
		} else if ( this.shouldFetchInitialPages( this.props ) ) {
			this.viewEarlierCommentsHandler();
			this.viewLaterCommentsHandler();
			this.alreadyLoadedInitialSet = true;
		} else {
			this.props.requestPostComments( { siteId, postId, status } );
		}
	}

	componentWillReceiveProps( nextProps ) {
		const siteId = get( nextProps, 'post.site_ID' );
		const postId = get( nextProps, 'post.ID' );
		const status = get( nextProps, 'commentsFilter' );

		if ( this.shouldFetchInitialComment( nextProps ) ) {
			// there is an edgecase the initialComment can change while on the same post
			// in this case we can't just load the exact comment in question because
			// we could create a gap in the list.
			if ( this.props.commentsTree ) {
				this.viewEarlierCommentsHandler();
			} else {
				this.props.requestComment( { siteId, commentId: nextProps.startingCommentId } );
			}
			this.hasScrolledToComment = false;
		} else if ( this.shouldFetchInitialPages( nextProps ) ) {
			this.viewEarlierCommentsHandler();
			this.viewLaterCommentsHandler();
			this.alreadyLoadedInitialSet = true;
		} else if ( this.shouldNormalFetchAfterPropsChange( nextProps ) ) {
			nextProps.requestPostComments( { siteId, postId, status } );
		}

		// first defer is to give the startingCommentId time to render to the dom
		// second defer is to give the above/below comments to render to the dom
		delay( () => {
			if ( this.shouldScrollToComment( nextProps ) ) {
				delay( () => this.scrollToComment(), 50 );
			}
		}, 50 );
	}

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
				activeReplyCommentId={ this.state.activeReplyCommentId }
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

	onReplyClick = commentID => {
		this.setState( { activeReplyCommentId: commentID } );
		recordAction( 'comment_reply_click' );
		recordGaEvent( 'Clicked Reply to Comment' );
		recordTrack( 'calypso_reader_comment_reply_click', {
			blog_id: this.props.post.site_ID,
			comment_id: commentID,
		} );
	};

	onReplyCancel = () => {
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

	resetActiveReplyComment = () => {
		this.setState( { activeReplyCommentId: null } );
	};

	renderCommentsList = commentIds => {
		return (
			<ol className="comments__list is-root">
				{ commentIds.map( commentId => this.renderComment( commentId ) ) }
			</ol>
		);
	};

	renderCommentForm = () => {
		const post = this.props.post;
		const commentText = this.state.commentText;

		// Are we displaying the comment form at the top-level?
		if ( this.state.activeReplyCommentId && ! this.state.errors ) {
			return null;
		}

		return (
			<PostCommentForm
				ref="postCommentForm"
				post={ post }
				parentCommentId={ null }
				commentText={ commentText }
				onUpdateCommentText={ this.onUpdateCommentText }
			/>
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
		const { post: { ID: postId, site_ID: siteId }, commentsFilter: status } = this.props;
		const amountOfCommentsToTake = this.state.amountOfCommentsToTake + this.props.pageSize;

		this.setState( { amountOfCommentsToTake } );
		this.props.requestPostComments( { siteId, postId, status, direction } );
	};

	handleFilterClick = commentsFilter => () => this.props.onFilterChange( commentsFilter );

	render() {
		if ( ! this.props.commentsTree ) {
			return null;
		}

		const { commentsFilter, commentsTree, showFilters, commentCount } = this.props;
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

		return (
			<div className="comments__comment-list">
				{ ( this.props.showCommentCount || showViewMoreComments ) &&
					<div className="comments__info-bar">
						{ this.props.showCommentCount && <CommentCount count={ actualCommentsCount } /> }
						{ showViewMoreComments
							? <span className="comments__view-more" onClick={ this.viewEarlierCommentsHandler }>
									{ translate( 'Load more comments (Showing %(shown)d of %(total)d)', {
										args: {
											shown: displayedCommentsCount,
											total: actualCommentsCount,
										},
									} ) }
								</span>
							: null }
					</div> }
				{ showFilters &&
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
					</SegmentedControl> }
				{ this.renderCommentsList( displayedComments ) }
				{ showViewMoreComments &&
					this.props.startingCommentId &&
					<span className="comments__view-more" onClick={ this.viewLaterCommentsHandler }>
						{ translate( 'Load more comments (Showing %(shown)d of %(total)d)', {
							args: {
								shown: displayedCommentsCount,
								total: actualCommentsCount,
							},
						} ) }
					</span> }
				{ this.renderCommentForm() }
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		commentsTree: getPostCommentsTree(
			state,
			ownProps.post.site_ID,
			ownProps.post.ID,
			ownProps.commentsFilter
		),
		commentsFetchingStatus: commentsFetchingStatus(
			state,
			ownProps.post.site_ID,
			ownProps.post.ID,
			ownProps.commentCount
		),
		initialComment: getCommentById( {
			state,
			siteId: ownProps.post.site_ID,
			commentId: ownProps.startingCommentId,
		} ),
	} ),
	{ requestPostComments, requestComment }
)( PostCommentList );
