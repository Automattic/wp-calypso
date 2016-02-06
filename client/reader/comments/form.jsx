// External dependencies
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// Internal dependencies
import { translate } from 'lib/mixins/i18n';
import Gravatar from 'components/gravatar';
import Notice from 'components/notice';
import {
	getCurrentUser
} from 'state/current-user/selectors';
import {
	writeComment,
	removeComment
} from 'state/comments/actions';
import {
	recordAction,
	recordGaEvent,
	recordTrack
} from 'reader/stats';

class PostCommentForm extends React.Component {
	constructor( props ) {
		super();

		this.state = {
			isButtonActive: props.commentText && props.commentText.length > 0,
			isButtonVisible: props.commentText && props.commentText.length > 0
		};

		// bind event handlers to this instance
		Object.getOwnPropertyNames( PostCommentForm.prototype )
			.filter( ( prop ) => prop.indexOf( 'handle' ) === 0 )
			.filter( ( prop ) => typeof this[ prop ] === 'function' )
			.forEach( ( prop ) => this[ prop ] = this[ prop ].bind( this ) );
	}

	componentDidMount() {
		// If it's a reply, give the input focus
		if ( this.props.parentCommentID ) {
			this.refs.commentText.focus();
		}
	}

	componentDidUpdate() {
		const commentTextNode = this.refs.commentText;
		const commentText = this.getCommentText();
		const currentHeight = parseInt( commentTextNode.style.height, 10 ) || 0;

		commentTextNode.style.height = commentText.length ? Math.max( commentTextNode.scrollHeight, currentHeight ) + 'px' : null;
	}

	handleSubmit( event ) {
		event.preventDefault();
		this.submit();
	}

	handleKeyDown( event ) {
		// Use Ctrl+Enter to submit comment
		if ( event.keyCode === 13 && ( event.ctrlKey || event.metaKey ) ) {
			event.preventDefault();
			this.submit();
		}

		// Use ESC to remove the erroneous comment placeholder and just start over
		if ( event.keyCode === 27 ) {
			if ( this.props.placeholderId ) {
				// sync the text to the upper level so it won't be lost
				this.props.onUpdateCommentText( this.props.commentText );
				// remove the comment
				this.props.removeComment( this.props.post.site_ID, this.props.post.ID, this.props.placeholderId );
			}
		}
	}

	handleKeyUp() {
		this.updateCommentText();
	}

	handleFocus() {
		this.toggleButtonVisibility( true );
	}

	handleBlur() {
		if ( ! this.hasCommentText() ) {
			this.toggleButtonVisibility( false );
		}
	}

	toggleButtonVisibility( isVisible ) {
		this.setState( { isButtonVisible: isVisible } );
	}

	updateCommentText() {
		const commentText = this.getCommentText();

		// Update the comment text in the container's state
		this.props.onUpdateCommentText( commentText );

		// If there's content, make the button active
		this.setState( { isButtonActive: this.hasCommentText() } );
	}

	resetCommentText() {
		const commentTextNode = this.refs.commentText;
		commentTextNode.value = '';
		this.setState( { isButtonActive: false } );
		this.toggleButtonVisibility( false );
	}

	hasCommentText() {
		const commentText = this.getCommentText();
		return ( commentText && commentText.length > 0 );
	}

	getCommentText() {
		if ( ! this.refs.commentText ) {
			return;
		}

		return this.refs.commentText.value.trim();
	}

	submit() {
		const post = this.props.post;
		const commentTextNode = this.refs.commentText;
		const commentText = commentTextNode.value.trim();

		if ( ! commentText ) {
			this.resetCommentText(); // Clean up any newlines
			return false;
		}

		if ( this.props.placeholderId ) {
			this.props.removeComment( post.site_ID, post.ID, this.props.placeholderId );
		}
		this.props.writeComment( commentText, post.site_ID, post.ID, this.props.parentCommentID );

		recordAction( 'posted_comment' );
		recordGaEvent( 'Clicked Post Comment Button' );
		recordTrack( 'calypso_reader_article_commented_on', {
			blog_id: post.site_ID,
			post_id: post.ID,
			parent_post_id: this.props.parentCommentID ? this.props.parentCommentID : undefined
		} );

		this.resetCommentText();

		return true;
	}

	renderError() {
		const error = this.props.error;
		let message;

		if ( ! error ) {
			return null;
		}

		switch ( error.error ) {
			case 'comment_duplicate':
				message = translate( "Duplicate comment detected. It looks like you've already said that!" );
				break;

			default:
				message = translate( 'Sorry - there was a problem posting your comment.' );
				break;
		}

		return <Notice text={ message } className="reader-comments__notice" showDismiss={ false } status="is-error" />;
	}

	render() {
		const post = this.props.post;

		// Don't display the form if comments are closed
		if ( post && post.discussion && post.discussion.comments_open === false ) {
			// If we already have some comments, show a 'comments closed message'
			if ( post.discussion.comment_count && post.discussion.comment_count > 0 ) {
				return <p className="comments__form-closed">{ translate( 'Comments are closed.' ) }</p>;
			}

			return null;
		}

		const buttonClasses = classNames( {
			'is-active': this.state.isButtonActive,
			'is-visible': this.state.isButtonVisible
		} );

		return (
			<form className="comments__form" ref="commentForm">
				<fieldset>
					<Gravatar user={ this.props.currentUser } />
					<label>
						<textarea
							defaultValue={ this.props.commentText }
							rows="1"
							placeholder={ translate( 'Enter your comment here…' ) }
							ref="commentText"
							onKeyUp={ this.handleKeyUp }
							onKeyDown={ this.handleKeyDown }
							onFocus={ this.handleFocus }
							onBlur={ this.handleBlur } />
						<button ref="commentButton" className={ buttonClasses } disabled={ ! this.state.isButtonActive } onClick={ this.handleSubmit }>{ translate( 'Send' ) }</button>
						{ this.renderError() }
					</label>
				</fieldset>
			</form>
		);
	}

}

PostCommentForm.propTypes = {
	post: React.PropTypes.object.isRequired,
	parentCommentID: React.PropTypes.number,
	placeholderId: React.PropTypes.string, // can only be 'placeholder-123'
	commentText: React.PropTypes.string,
	onUpdateCommentText: React.PropTypes.func.isRequired,

	// connect()ed props:
	currentUser: React.PropTypes.object.isRequired,
	writeComment: React.PropTypes.func.isRequired,
	removeComment: React.PropTypes.func.isRequired
};

export default connect(
	( state ) => ( {
		currentUser: getCurrentUser( state )
	} ),
	( dispatch ) => bindActionCreators( {
		writeComment,
		removeComment
	}, dispatch )
)( PostCommentForm );
