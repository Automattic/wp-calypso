/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import {
	get,
	size,
	takeRight,
	delay,
	map,
	filter,
	compact,
	reject,
	includes,
	uniq,
	xor,
} from 'lodash';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/***
 * Internal dependencies
 */
import {
	getPostCommentsTree,
	commentsFetchingStatus,
	getDateSortedPostComments,
} from 'state/comments/selectors';
// import { NUMBER_OF_COMMENTS_PER_FETCH } from 'state/comments/constants';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import { requestPostComments, requestComment } from 'state/comments/actions';
import PostComment from 'blocks/comments/post-comment';
import PostCommentForm from 'blocks/comments/form';

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
		showCaterpillar: PropTypes.bool,

		// connect()ed props:
		commentsTree: PropTypes.object,
		requestPostComments: PropTypes.func.isRequired,
		requestComment: PropTypes.func.isRequired,
	};

	static defaultProps = {
		pageSize: 10,
		initialSize: 3,
		showCommentCount: true,
		maxDepth: Infinity,
	};

	/***
	 * Gets comments for display
	 * @param {Immutable.List<Number>} commentIds The top level commentIds to take from
	 * @param {Number} numberToTake How many top level comments to take
	 * @returns {Object} that has the displayed comments + total displayed count including children
	 */
	getDisplayedComments = numberToTake => {
		const latestComments = map(
			takeRight(
				filter(
					this.props.comments,
					comment => comment.type !== 'trackback' && comment.type !== 'pingback'
				),
				numberToTake
			),
			'ID'
		);

		return {
			displayedComments: latestComments,
			displayedCommentsCount: latestComments.length,
		};
	};

	state = {
		activeReplyCommentID: null,
		amountOfCommentsToTake: this.props.initialSize,
		displayedComments: this.getDisplayedComments( this.props.initialSize ),
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

	shouldFetchInitialPages = ( { startingCommentId, commentsTree } ) =>
		startingCommentId &&
		commentsTree[ startingCommentId ] &&
		this.props.commentsTree[ startingCommentId ] &&
		! this.alreadyLoadedInitialSet;

	shouldNormalFetchAfterPropsChange = nextProps => {
		const currentSiteId = get( this.props, 'post.site_ID' );
		const currentPostId = get( this.props, 'post.ID' );

		const nextSiteId = get( nextProps, 'post.site_ID' );
		const nextPostId = get( nextProps, 'post.ID' );

		const propsExist = nextSiteId && nextPostId;
		const propChanged = currentSiteId !== nextSiteId || currentPostId !== nextPostId;

		return propsExist && propChanged;
	};

	componentWillMount() {
		const { post: { ID: postId, site_ID: siteId } } = this.props;

		if ( this.shouldFetchInitialPages( this.props ) ) {
			this.viewEarlierCommentsHandler();
			this.viewLaterCommentsHandler();
			this.alreadyLoadedInitialSet = true;
		} else {
			this.props.requestPostComments( { siteId, postId } );
		}
	}

	componentWillReceiveProps( nextProps ) {
		const siteId = get( nextProps, 'post.site_ID' );
		const postId = get( nextProps, 'post.ID' );

		if ( this.shouldFetchInitialPages( nextProps ) ) {
			this.viewEarlierCommentsHandler();
			this.viewLaterCommentsHandler();
			this.alreadyLoadedInitialSet = true;
		} else if ( this.shouldNormalFetchAfterPropsChange( nextProps ) ) {
			nextProps.requestPostComments( { siteId, postId } );
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
				activeReplyCommentID={ this.state.activeReplyCommentID }
				onEditCommentClick={ onEditCommentClick }
				onEditCommentCancel={ this.onEditCommentCancel }
				onReplyClick={ this.onReplyClick }
				onReplyCancel={ this.onReplyCancel }
				commentText={ this.commentText }
				onUpdateCommentText={ this.onUpdateCommentText }
				onCommentSubmit={ this.resetActiveReplyComment }
				depth={ 0 }
				maxDepth={ this.props.maxDepth }
				showNestingReplyArrow
				showOnly={ this.state.displayedComments.displayedComments }
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
		const { post: { ID: postId, site_ID: siteId } } = this.props;
		const amountOfCommentsToTake = this.state.amountOfCommentsToTake + this.props.pageSize;
		const displayedComments = this.getDisplayedComments( amountOfCommentsToTake );

		this.setState( { amountOfCommentsToTake, displayedComments } );
		this.props.requestPostComments( { siteId, postId, direction } );
	};

	render() {
		if ( ! this.props.commentsTree ) {
			return null;
		}

		const { commentsTree, commentCount } = this.props;
		const {
			haveEarlierCommentsToFetch,
			haveLaterCommentsToFetch,
		} = this.props.commentsFetchingStatus;

		const amountOfCommentsToTake = !! this.props.startingCommentId
			? Infinity
			: this.state.amountOfCommentsToTake;

		const { displayedCommentsCount } = this.state.displayedComments;

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
			<div className="conversations_comment-list">
				{ ( this.props.showCommentCount || showViewMoreComments ) &&
					<div className="comments__info-bar">
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
				{ this.renderCommentsList( commentsTree.children ) }
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		commentsTree: getPostCommentsTree( state, ownProps.post.site_ID, ownProps.post.ID ),
		comments: getDateSortedPostComments( state, ownProps.post.site_ID, ownProps.post.ID ),
		commentsFetchingStatus: commentsFetchingStatus(
			state,
			ownProps.post.site_ID,
			ownProps.post.ID,
			ownProps.commentCount
		),
	} ),
	{ requestPostComments, requestComment }
)( PostCommentList );
