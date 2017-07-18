/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';
import { get, size, takeRight } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getPostCommentsTree,
	getPostTotalCommentsCount,
	haveEarlierCommentsToFetch,
	haveLaterCommentsToFetch,
	haveReceivedBeforeAndAfter,
} from 'state/comments/selectors';
import { requestPostComments, requestComment } from 'state/comments/actions';
import { NUMBER_OF_COMMENTS_PER_FETCH } from 'state/comments/constants';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import PostComment from './post-comment';
import PostCommentForm from './form';
import CommentCount from './comment-count';
import SegmentedControl from 'components/segmented-control';
import SegmentedControlItem from 'components/segmented-control/item';

class PostCommentList extends React.Component {
	static propTypes = {
		post: React.PropTypes.shape( {
			ID: React.PropTypes.number.isRequired,
			site_ID: React.PropTypes.number.isRequired,
		} ).isRequired,
		initialSize: React.PropTypes.number,
		pageSize: React.PropTypes.number,
		showCommentCount: React.PropTypes.bool,
		startingCommentId: React.PropTypes.number,
		commentCount: React.PropTypes.number,

		// connect()ed props:
		commentsTree: React.PropTypes.object, //TODO: Find a lib that provides immutable shape
		totalCommentsCount: React.PropTypes.number,
		haveReceivedBeforeAndAfter: React.PropTypes.bool,
		haveEarlierCommentsToFetch: React.PropTypes.bool,
		haveLaterCommentsToFetch: React.PropTypes.bool,
		requestPostComments: React.PropTypes.func.isRequired,
	};

	static defaultProps = {
		pageSize: NUMBER_OF_COMMENTS_PER_FETCH,
		initialSize: NUMBER_OF_COMMENTS_PER_FETCH,
		haveEarlierCommentsToFetch: false,
		haveLaterCommentsToFetch: false,
		showCommentCount: true,
	};

	state = {
		activeReplyCommentID: null,
		amountOfCommentsToTake: this.props.initialSize,
		commentsFilter: 'all',
		activeEditCommentId: null,
	};

	componentWillMount() {
		const {
			post: { ID: postId, site_ID: siteId },
			commentsFilter: status,
			startingCommentId,
		} = this.props;

		if ( startingCommentId && this.props.commentsTree[ startingCommentId ] ) {
			this.viewEarlierCommentsHandler();
			this.viewLaterCommentsHandler();
			this.alreadyLoadedInitialSet = true;
		} else if ( startingCommentId ) {
			this.props.requestComment( { siteId, commentId: this.props.startingCommentId } );
		} else {
			this.props.requestPostComments( { siteId, postId, status } );
		}
	}

	componentWillReceiveProps( nextProps ) {
		const nextSiteId = get( nextProps, 'post.site_ID' );
		const nextPostId = get( nextProps, 'post.ID' );
		const nextCommentsFilter = get( nextProps, 'commentsFilter' );
		const nextStartingCommentId = get( nextProps, 'startingCommentId' );
		// todo: sort out this nonesense

		if (
			nextStartingCommentId &&
			nextProps.commentsTree[ nextStartingCommentId ] &&
			! this.alreadyLoadedInitialSet
		) {
			this.viewEarlierCommentsHandler();
			this.viewLaterCommentsHandler();
			this.alreadyLoadedInitialSet = true;
		} else if ( nextStartingCommentId & ! nextProps.commentsTree[ nextStartingCommentId ] ) {
			this.props.requestComment( { siteId: nextSiteId, commentId: this.props.startingCommentId } );
		} else if (
			nextSiteId &&
			nextPostId &&
			nextCommentsFilter &&
			( this.props.post.site_ID !== nextSiteId ||
				this.props.post.ID !== nextPostId ||
				this.props.commentsFilter !== nextCommentsFilter )
		) {
			this.props.requestPostComments( {
				siteId: nextSiteId,
				postId: nextPostId,
				status: this.props.commentsFilter,
			} );
		}

		if ( this.shouldScrollToComment( nextProps ) ) {
			this.scrollToComment();
		}
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
				activeReplyCommentID={ this.state.activeReplyCommentID }
				onEditCommentClick={ onEditCommentClick }
				onEditCommentCancel={ this.onEditCommentCancel }
				onReplyClick={ this.onReplyClick }
				onReplyCancel={ this.onReplyCancel }
				commentText={ this.commentText }
				onUpdateCommentText={ this.onUpdateCommentText }
				onCommentSubmit={ this.resetActiveReplyComment }
				depth={ 0 }
			/>
		);
	};

	onEditCommentClick = commentId => {
		this.setState( { activeEditCommentId: commentId } );
	};

	onEditCommentCancel = () => this.setState( { activeEditCommentId: null } );

	onReplyClick = commentID => {
		this.setState( { activeReplyCommentID: commentID } );
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
			comment_id: this.state.activeReplyCommentID,
		} );
		this.resetActiveReplyComment();
	};

	onUpdateCommentText = commentText => {
		this.setState( { commentText: commentText } );
	};

	resetActiveReplyComment = () => {
		this.setState( { activeReplyCommentID: null } );
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
		if ( this.state.activeReplyCommentID && ! this.state.errors ) {
			return null;
		}

		return (
			<PostCommentForm
				ref="postCommentForm"
				post={ post }
				parentCommentID={ null }
				commentText={ commentText }
				onUpdateCommentText={ this.onUpdateCommentText }
			/>
		);
	};

	scrollToComment = () => {
		const comment = window.document.getElementsByName( window.location.hash.substring( 1 ) )[ 0 ];
		comment.scrollIntoView();
		window.scrollBy( 0, -50 );
		this.hasScrolledToComment = true;
	};

	/**
	 * Should we scroll down to a comment? Only if we have satisfied these conditions:
	 * 1. there is a startingCommentId
	 * 2. the comment has loaded and is on the DOM
	 * 3. we haven't already scrolled to it yet
	 * 4. we have loaded some comments above + below it already (or there is only 1 comment)
	 *
	 * @returns {boolean} - whether or not we should scroll to a comment
	 */
	shouldScrollToComment = ( props = this.props ) =>
		props.startingCommentId &&
		props.commentsTree[ this.props.startingCommentId ] &&
		props.haveReceivedBeforeAndAfter &&
		! this.hasScrolledToComment &&
		window.document.getElementsByName( `comment-${ props.startingCommentId }` ).length > 0;

	getCommentsCount = commentIds => {
		// we always count prevSum, children sum, and +1 for the current processed comment
		return commentIds.reduce(
			( prevSum, commentId ) =>
				prevSum +
				this.getCommentsCount( get( this.props.commentsTree, [ commentId, 'children' ] ) ) +
				1,
			0,
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
		const direction = this.props.haveEarlierCommentsToFetch ? 'before' : 'after';
		this.loadMoreCommentsHandler( direction );
	};

	viewLaterCommentsHandler = () => {
		const direction = this.props.haveLaterCommentsToFetch ? 'after' : 'before';
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

		const { commentsFilter, commentsTree, showFilters, totalCommentsCount } = this.props;

		const { amountOfCommentsToTake } = this.state;

		const { displayedComments, displayedCommentsCount } = this.getDisplayedComments(
			commentsTree.children,
			amountOfCommentsToTake,
		);

		// Note: we might show fewer comments than totalCommentsCount because some comments might be
		// orphans (parent deleted/unapproved), that comment will become unreachable but still counted.
		const showViewMoreComments =
			size( commentsTree.children ) > amountOfCommentsToTake ||
			this.props.haveEarlierCommentsToFetch ||
			this.props.haveLaterCommentsToFetch;

		// If we're not yet fetched all comments from server, we can only rely on server's count.
		// once we got all the comments tree, we can calculate the count of reachable comments
		const actualTotalCommentsCount =
			this.props.haveEarlierCommentsToFetch || this.props.haveLaterCommentsToFetch
				? Math.max( totalCommentsCount, this.props.commentCount )
				: this.getCommentsCount( commentsTree.children );

		return (
			<div className="comments__comment-list">
				{ ( this.props.showCommentCount || showViewMoreComments ) &&
					<div className="comments__info-bar">
						{ this.props.showCommentCount && <CommentCount count={ actualTotalCommentsCount } /> }
						{ showViewMoreComments
							? <span className="comments__view-more" onClick={ this.viewEarlierCommentsHandler }>
									{ translate( 'Load more comments (Showing %(shown)d of %(total)d)', {
										args: {
											shown: displayedCommentsCount,
											total: actualTotalCommentsCount,
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
						{ translate( 'Load More Comments (Showing %(shown)d of %(total)d)', {
							args: {
								shown: displayedCommentsCount,
								total: actualTotalCommentsCount,
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
			ownProps.commentsFilter,
		),
		totalCommentsCount:
			getPostTotalCommentsCount( state, ownProps.post.site_ID, ownProps.post.ID ) || 0,
		haveEarlierCommentsToFetch: haveEarlierCommentsToFetch(
			state,
			ownProps.post.site_ID,
			ownProps.post.ID,
			ownProps.commentCount,
		),
		haveLaterCommentsToFetch: haveLaterCommentsToFetch(
			state,
			ownProps.post.site_ID,
			ownProps.post.ID,
			ownProps.commentCount,
		),
		haveReceivedBeforeAndAfter: haveReceivedBeforeAndAfter(
			state,
			ownProps.post.site_ID,
			ownProps.post.ID,
		),
	} ),
	{ requestPostComments, requestComment },
)( PostCommentList );
