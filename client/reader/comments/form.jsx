// External dependencies
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import noop from 'lodash/noop';
import { translate } from 'i18n-calypso';

// Internal dependencies
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
	recordTrackForPost
} from 'reader/stats';

class PostCommentForm extends React.Component {
	constructor( props ) {
		super();

		this.state = {
			commentText: props.commentText || '',
			haveFocus: false
		};

		// bind event handlers to this instance
		Object.getOwnPropertyNames( PostCommentForm.prototype )
			.filter( ( prop ) => prop.indexOf( 'handle' ) === 0 )
			.filter( ( prop ) => typeof this[ prop ] === 'function' )
			.forEach( ( prop ) => this[ prop ] = this[ prop ].bind( this ) );
	}

	componentWillReceiveProps( nextProps ) {
		this.setState( {
			commentText: nextProps.commentText || ''
		} );
	}

	componentDidMount() {
		// If it's a reply, give the input focus if commentText exists ( can not exist if comments are closed )
		if ( this.props.parentCommentID && this._textareaNode ) {
			this._textareaNode.focus();
		}
	}

	componentDidUpdate() {
		const commentTextNode = this.refs.commentText;

		if ( ! commentTextNode ) {
			return;
		}

		const commentText = this.getCommentText();
		const currentHeight = parseInt( commentTextNode.style.height, 10 ) || 0;
		commentTextNode.style.height = commentText.length ? Math.max( commentTextNode.scrollHeight, currentHeight ) + 'px' : null;
	}

	handleTextAreaNode( textareaNode ) {
		this._textareaNode = textareaNode;
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

	handleFocus() {
		this.setState( { haveFocus: true } );
	}

	handleTextChange( event ) {
		const commentText = event.target.value;

		this.setState( { commentText } );

		// Update the comment text in the container's state
		this.props.onUpdateCommentText( commentText );
	}

	resetCommentText() {
		this.setState( { commentText: '' } );

        // Update the comment text in the container's state
		this.props.onUpdateCommentText( '' );
	}

	hasCommentText() {
		return this.state.commentText.trim().length > 0;
	}

	submit() {
		const post = this.props.post;
		const commentText = this.state.commentText.trim();

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
		recordTrackForPost( 'calypso_reader_article_commented_on', post, {
			parent_post_id: this.props.parentCommentID ? this.props.parentCommentID : undefined
		} );

		this.resetCommentText();

		// Resets the active reply comment in PostCommentList
		this.props.onCommentSubmit();

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
			'is-active': this.hasCommentText(),
			'is-visible': this.state.haveFocus || this.hasCommentText()
		} );

		const expandingAreaClasses = classNames( {
			focused: this.state.haveFocus,
			'expanding-area': true
		} );

		// how auto expand works for that textarea is covered in this article: http://alistapart.com/article/expanding-text-areas-made-elegant
		return (
			<form className="comments__form" ref="commentForm">
				<fieldset>
					<Gravatar user={ this.props.currentUser } />
					<label>
						<div className={ expandingAreaClasses } >
							<pre><span>{ this.state.commentText }</span><br/></pre>
							<textarea
								value={ this.state.commentText }
								placeholder={ translate( 'Enter your comment here…' ) }
								ref={ this.handleTextAreaNode }
								onKeyUp={ this.handleKeyUp }
								onKeyDown={ this.handleKeyDown }
								onFocus={ this.handleFocus }
								onBlur={ this.handleBlur }
								onChange={ this.handleTextChange }
							/>
						</div>
						<button ref="commentButton" className={ buttonClasses } disabled={ this.state.commentText.length === 0 } onClick={ this.handleSubmit }>
							{ translate( 'Send' ) }
						</button>
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
	onCommentSubmit: React.PropTypes.func,

	// connect()ed props:
	currentUser: React.PropTypes.object.isRequired,
	writeComment: React.PropTypes.func.isRequired,
	removeComment: React.PropTypes.func.isRequired
};

PostCommentForm.defaultProps = {
	onCommentSubmit: noop
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
