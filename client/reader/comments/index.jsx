// External Dependencies
var React = require( 'react' ),
	map = require( 'lodash/collection/map' ),
	noop = require( 'lodash/utility/noop' ),
	find = require( 'lodash/collection/find' );

// Internal Dependencies
var Gravatar = require( 'components/gravatar' ),
	User = require( 'lib/user' )().get(),
	CommentStore = require( 'lib/comment-store/comment-store' ),
	CommentStates = require( 'lib/comment-store/constants' ).state,
	PostTime = require( 'reader/post-time' ),
	PostCommentForm = require( './form' ),
	CommentLikeButtonContainer = require( './comment-likes' ),
	stats = require( 'reader/stats' ),
	PostCommentContent = require( './post-comment-content' ),
	Gridicon = require( 'components/gridicon' );

var PostComment = React.createClass( {

	propTypes: {
		comments: React.PropTypes.object.isRequired,
		comment: React.PropTypes.object.isRequired,
		onReplyClick: React.PropTypes.func,
		errors: React.PropTypes.array,
		depth: React.PropTypes.number,
		post: React.PropTypes.object
	},

	getInitialState: function() {
		return {};
	},

	getDefaultProps: function() {
		return {
			onReplyClick: noop,
			errors: [],
			depth: 0
		};
	},

	componentWillMount: function() {
		this.setState( { depth: parseInt( this.props.depth, 10 ) + 1 } );
	},

	renderRepliesList: function() {
		var comments = this.props.comments,
			comment = this.props.comment,
			replies = null,
			props = this.props,
			depth = this.state.depth,
			replyListItems;

		// Are there any replies to the current comment?
		if ( comments && comments[ comment.ID ] ) {
			replies = comments[ comment.ID ];
		}

		if ( ! replies ) {
			return null;
		}

		replyListItems = map( replies, function( reply ) {
			return (
				<PostComment { ...props } depth={ depth } key={ reply.ID } comment={ reply } />
			);
		} );

		return <ol className="comments__list">{ replyListItems }</ol>;
	},

	handleReply: function() {
		var comment = this.props.comment;
		this.props.onReplyClick( comment.ID );
	},

	recordAuthorClick: function() {
		stats.recordAction( 'comment_author_click' );
		stats.recordGaEvent( 'Clicked Author Name' );
		stats.recordTrack( 'calypso_reader_comment_author_click', {
			blog_id: this.props.post.site_ID,
			post_id: this.props.post.ID,
			comment_id: this.props.comment.ID,
			author_url: this.props.comment.author.URL
		} );
	},

	renderCommentForm: function() {
		var post = this.props.post,
			comment = this.props.comment,
			commentText = this.props.commentText,
			onUpdateCommentText = this.props.onUpdateCommentText;

		if ( this.props.activeReplyCommentID !== comment.ID ) {
			return null;
		}

		return <PostCommentForm
					ref="postCommentForm"
					post={ post }
					parentCommentID={ comment.ID }
					commentText={ commentText }
					onUpdateCommentText={ onUpdateCommentText } />;
	},

	renderCommentActions: function( comment ) {
		var showCancelReplyButton = false,
			onReplyCancel = this.props.onReplyCancel,
			post = this.props.post,
			showReplyButton = true;

		// Only render actions for confirmed comments
		if ( comment.state !== CommentStates.CONFIRMED ) {
			return null;
		}

		if ( this.props.activeReplyCommentID === comment.ID ) {
			showCancelReplyButton = true;
		}

		if ( post && post.discussion && post.discussion.comments_open === false ) {
			showReplyButton = false;
		}

		return (
			<div className="comment__actions">
				{ showReplyButton ?
					<button className="comment__actions-reply" onClick={ this.handleReply }>
						<Gridicon icon="reply" size="18" />
						<span className="comment__actions-reply-label">Reply</span>
					</button>
				: null }
				{ showCancelReplyButton ? <button className="comment__actions-cancel-reply" onClick={ onReplyCancel }>Cancel reply</button> : null }
				<CommentLikeButtonContainer className="comment__actions-like" tagName="button" siteId={ this.props.post.site_ID } commentId={ comment.ID } />
				<span className="comment__actions-like-count">{ comment.like_count ? comment.like_count : null } likes</span>
			</div>
		);
	},

	render: function() {
		var comment = this.props.comment,
			error = find( this.props.errors, { ID: comment.ID } );

		// If it's a pending comment, use the current user as the author
		if ( comment.state && comment.state === CommentStates.PENDING ) {
			comment.author = User;
			comment.author.name = User.display_name;
		}

		// If we have an error, render the error component instead
		if ( error && comment.state && comment.state === CommentStates.ERROR ) {
			return ( <PostCommentWithError { ...this.props } repliesList={ this.renderRepliesList() } /> );
		}

		return (
			<li className={ 'comment depth-' + this.props.depth }>
				<div className="comment__author">
					<Gravatar user={ comment.author } />

					{ comment.author.URL
						? <a href={ comment.author.URL } target="_blank" className="comment__username" onClick={ this.recordAuthorClick }>{ comment.author.name }<Gridicon icon="external" /></a>
						: <strong className="comment__username">{ comment.author.name }</strong> }
					<small className="comment__timestamp">
						<a href={ comment.URL }>
							<PostTime date={ comment.date } />
						</a>
					</small>
				</div>

				{ comment.status && comment.status === 'unapproved'
					? <p className="comment__moderation">{ this.translate( 'Your comment is awaiting moderation.' ) }</p>
					: null }

				<PostCommentContent content={ comment.content } state={ comment.state } />

				{ this.renderCommentActions( comment ) }
				{ this.renderCommentForm() }
				{ this.renderRepliesList() }
			</li>
		);
	}

} );

var PostCommentWithError = React.createClass( {

	propTypes: {
		comments: React.PropTypes.object.isRequired,
		comment: React.PropTypes.object.isRequired,
		errors: React.PropTypes.array
	},

	getDefaultProps: function() {
		return { errors: [] };
	},

	renderCommentForm: function() {
		var post = this.props.post,
			comment = this.props.comment,
			commentText = comment.content,
			onUpdateCommentText = this.props.onUpdateCommentText,
			error = find( this.props.errors, { ID: comment.ID } );

		return <PostCommentForm
					ref="postCommentForm"
					post={ post }
					parentCommentID={ comment.parent.ID }
					commentText={ commentText }
					onUpdateCommentText={ onUpdateCommentText }
					error={ error } />;
	},

	render: function() {
		return (
			<li className="comment is-error">
				{ this.renderCommentForm() }
				{ this.props.repliesList }
			</li>
		);
	}
} );

var PostCommentList = React.createClass( {

	getInitialState: function() {
		var state = this.getStateFromStores();
		state.activeReplyCommentID = 0;
		return state;
	},

	getStateFromStores: function( props = this.props ) {
		const post = props.post;
		return {
			comments: CommentStore.getCommentsForPost( post.site_ID, post.ID ),
			errors: CommentStore.getErrorsForPost( post.site_ID, post.ID )
		};
	},

	// Add change listeners to stores
	componentDidMount: function() {
		CommentStore.on( 'change', this._onChange );
		CommentStore.on( 'add', this._onAdd );
	},

	componentDidUpdate: function() {
		this.props.onCommentsUpdate();
	},

	// Remove change listers from stores
	componentWillUnmount: function() {
		CommentStore.off( 'change', this._onChange );
		CommentStore.off( 'add', this._onAdd );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.post !== this.props.post ) {
			this.setState( this.getStateFromStores( nextProps ) );
		}
	},

	renderCommentsList: function() {
		var post = this.props.post,
			comments = this.state.comments,
			commentListItems = [],
			errors = this.state.errors,
			activeReplyCommentID = this.state.activeReplyCommentID,
			onReplyClick = this.onReplyClick,
			onReplyCancel = this.onReplyCancel,
			commentText = this.state.commentText,
			onUpdateCommentText = this.onUpdateCommentText;

		// Top-level comments
		if ( ! comments || ! comments[ 0 ] ) {
			return null;
		}

		comments[ 0 ].forEach( function( comment ) {
			commentListItems.push(
				<PostComment
					post={ post }
					comments={ comments }
					comment={ comment }
					errors={ errors }
					key={ comment.ID }
					activeReplyCommentID={ activeReplyCommentID }
					onReplyClick={ onReplyClick }
					onReplyCancel={ onReplyCancel }
					commentText={ commentText }
					onUpdateCommentText={ onUpdateCommentText }
					depth={ 0 } />
			);
		} );

		return <ol className="comments__list is-root">{ commentListItems }</ol>;
	},

	renderCommentForm: function() {
		var post = this.props.post,
			commentText = this.state.commentText,
			onUpdateCommentText = this.onUpdateCommentText;

		// Are we displaying the comment form at the top-level?
		if ( this.state.activeReplyCommentID !== 0 && ! this.state.errors ) {
			return null;
		}

		return <PostCommentForm
					ref="postCommentForm"
					post={ post }
					parentCommentID="0"
					commentText={ commentText }
					onUpdateCommentText={ onUpdateCommentText } />;
	},

	onReplyClick: function( commentID ) {
		this.setState( { activeReplyCommentID: commentID } );
		stats.recordAction( 'comment_reply_click' );
		stats.recordGaEvent( 'Clicked Reply to Comment' );
		stats.recordTrack( 'calypso_reader_comment_reply_click', {
			blog_id: this.props.post.site_ID,
			comment_id: commentID
		} );
	},

	onReplyCancel: function() {
		stats.recordAction( 'comment_reply_cancel_click' );
		stats.recordGaEvent( 'Clicked Cancel Reply to Comment' );
		stats.recordTrack( 'calypso_reader_comment_reply_cancel_click', {
			blog_id: this.props.post.site_ID,
			comment_id: this.state.activeReplyCommentID
		} );
		this.setState( { activeReplyCommentID: 0 } );
	},

	onUpdateCommentText: function( commentText ) {
		this.setState( { commentText: commentText } );
	},

	_onChange: function() {
		this.setState( this.getStateFromStores() );
	},

	_onAdd: function() {
		this.setState( this.getStateFromStores() );
		this.setState( {
			commentText: '',
			activeReplyCommentID: 0
		} );
	},

	render: function() {
		var post = this.props.post;
		var commentCount = post.comment_count;

		// If we haven't loaded any comments yet, don't display anything
		if ( this.state.comments === null ) {
			return null;
		}

		return (
			<div className="comments">
				<h3 className="comments__count">{ commentCount } comments</h3>
				{ this.renderCommentsList() }
				{ this.renderCommentForm() }
			</div>
		);
	}

} );

module.exports = PostCommentList;
