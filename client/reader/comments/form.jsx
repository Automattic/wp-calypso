// External dependencies
var React = require( 'react' ),
	classNames = require( 'classnames' );

// Internal dependencies
var Gravatar = require( 'components/gravatar' ),
	User = require( 'lib/user' )().get(),
	CommentActions = require( 'lib/comment-store/actions' ),
	Notice = require( 'components/notice' ),
	stats = require( 'reader/stats' );

var PostCommentForm = React.createClass( {

	propTypes: {
		post: React.PropTypes.object.isRequired,
		parentCommentID: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.number ] ), // Can be 'pending0', for example
		commentText: React.PropTypes.string,
		onUpdateCommentText: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			isButtonActive: false,
			isButtonVisible: false
		};
	},

	componentDidMount: function() {
		// If it's a reply, give the input focus
		if ( this.props.parentCommentID > 0 ) {
			this.refs.commentText.focus();
		}
	},

	handleSubmit: function( event ) {
		event.preventDefault();
		this.submit();
	},

	handleKeyDown: function( event ) {
		// Use Ctrl+Enter to submit comment
		if ( event.keyCode === 13 && ( event.ctrlKey || event.metaKey ) ) {
			event.preventDefault();
			this.submit();
		}
	},

	handleKeyUp: function() {
		this.updateCommentText();
	},

	handleFocus: function() {
		this.toggleButtonVisibility( true );
	},

	handleBlur: function() {
		if ( ! this.hasCommentText() ) {
			this.toggleButtonVisibility( false );
		}
	},

	toggleButtonVisibility: function( isVisible ) {
		this.setState( { isButtonVisible: isVisible } );
	},

	updateCommentText: function() {
		var commentText = this.getCommentText(),
			isButtonActive;

		// Update the comment text in the container's state
		this.props.onUpdateCommentText( commentText );

		// If there's content, make the button active
		isButtonActive = false;
		if ( this.hasCommentText() ) {
			isButtonActive = true;
		}

		this.setState( { isButtonActive: isButtonActive } );
	},

	resetCommentText: function() {
		var commentTextNode = this.refs.commentText;
		commentTextNode.value = '';
		this.setState( { isButtonActive: false } );
		this.toggleButtonVisibility( false );
	},

	hasCommentText: function() {
		var commentText = this.getCommentText();
		return ( commentText && commentText.length > 0 );
	},

	getCommentText: function() {
		if ( ! this.refs.commentText ) {
			return;
		}

		return this.refs.commentText.value.trim();
	},

	submit: function() {
		var post = this.props.post,
			commentTextNode = this.refs.commentText,
			commentText = commentTextNode.value.trim();

		if ( ! commentText ) {
			this.resetCommentText(); // Clean up any newlines
			return false;
		}

		if ( this.props.parentCommentID > 0 ) {
			CommentActions.reply( post.site_ID, post.ID, this.props.parentCommentID, commentText );
		} else {
			CommentActions.add( post.site_ID, post.ID, commentText );
		}

		stats.recordAction( 'posted_comment' );
		stats.recordGaEvent( 'Clicked Post Comment Button' );
		stats.recordTrack( 'calypso_reader_article_commented_on' );

		this.resetCommentText();

		return true;
	},

	renderError: function() {
		var error = this.props.error,
			message;

		if ( ! error ) {
			return null;
		}

		switch ( error.error ) {
			case 'comment_duplicate':
				message = this.translate( "Duplicate comment detected. It looks like you've already said that!" );
				break;

			default:
				message = this.translate( 'Sorry - there was a problem posting your comment.' );
				break;
		}

		return <Notice text={ message } className="reader-comments__notice" showDismiss={ false } status="is-error" />;
	},

	render: function() {
		var post = this.props.post,
			buttonDisabled = true,
			buttonClasses;

		// Don't display the form if comments are closed
		if ( post && post.discussion && post.discussion.comments_open === false ) {
			// If we already have some comments, show a 'comments closed message'
			if ( post.discussion.comment_count && post.discussion.comment_count > 0 ) {
				return <p className="comments__form-closed">{ this.translate( 'Comments are closed.' ) }</p>;
			}

			return null;
		}

		if ( this.state.isButtonActive ) {
			buttonDisabled = false;
		}

		buttonClasses = classNames( {
			'is-active': this.state.isButtonActive,
			'is-visible': this.state.isButtonVisible
		} );

		return (
			<form className="comments__form" ref="commentForm">
				<fieldset>
					<Gravatar user={ User } />
					<label>
						<textarea
							defaultValue={ this.props.commentText }
							rows="1"
							placeholder={ this.translate( 'Enter your comment here…' ) }
							ref="commentText"
							onKeyUp={ this.handleKeyUp }
							onKeyDown={ this.handleKeyDown }
							onFocus={ this.handleFocus }
							onBlur={ this.handleBlur } />
						<button ref="commentButton" className={ buttonClasses } disabled={ buttonDisabled } onClick={ this.handleSubmit }>{ this.translate( 'Send' ) }</button>
						{ this.renderError() }
					</label>
				</fieldset>
			</form>
		);
	}

} );

module.exports = PostCommentForm;
