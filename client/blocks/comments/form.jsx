/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { noop } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AutoDirection from 'components/auto-direction';
import FormInputValidation from 'components/forms/form-input-validation';
import Gravatar from 'components/gravatar';
import { getCurrentUser } from 'state/current-user/selectors';
import { writeComment, deleteComment, replyComment } from 'state/comments/actions';
import { recordAction, recordGaEvent, recordTrackForPost } from 'reader/stats';
import { isCommentableDiscoverPost } from 'blocks/comments/helper';
import PostCommentFormTextarea from './form-textarea';

class PostCommentForm extends React.Component {
	constructor( props ) {
		super();

		this.state = {
			commentText: props.commentText || '',
			haveFocus: false,
		};

		// bind event handlers to this instance
		Object.getOwnPropertyNames( PostCommentForm.prototype )
			.filter( prop => prop.indexOf( 'handle' ) === 0 )
			.filter( prop => typeof this[ prop ] === 'function' )
			.forEach( prop => ( this[ prop ] = this[ prop ].bind( this ) ) );
	}

	componentWillReceiveProps( nextProps ) {
		this.setState( {
			commentText: nextProps.commentText || '',
		} );
	}

	componentDidMount() {
		// If it's a reply, give the input focus if commentText exists ( can not exist if comments are closed )
		if ( this.props.parentCommentId && this._textareaNode ) {
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
		commentTextNode.style.height = commentText.length
			? Math.max( commentTextNode.scrollHeight, currentHeight ) + 'px'
			: null;
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
				this.props.deleteComment(
					this.props.post.site_ID,
					this.props.post.ID,
					this.props.placeholderId
				);
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
			this.props.deleteComment( post.site_ID, post.ID, this.props.placeholderId );
		}

		if ( this.props.parentCommentId ) {
			this.props.replyComment( commentText, post.site_ID, post.ID, this.props.parentCommentId );
		} else {
			this.props.writeComment( commentText, post.site_ID, post.ID );
		}

		recordAction( 'posted_comment' );
		recordGaEvent( 'Clicked Post Comment Button' );
		recordTrackForPost( 'calypso_reader_article_commented_on', post, {
			parent_post_id: this.props.parentCommentId ? this.props.parentCommentId : undefined,
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

		switch ( this.props.errorType ) {
			case 'comment_duplicate':
				message = translate(
					"Duplicate comment detected. It looks like you've already said that!"
				);
				break;

			default:
				message = translate( 'Sorry - there was a problem posting your comment.' );
				break;
		}

		return <FormInputValidation isError text={ message } />;
	}

	render() {
		const post = this.props.post;

		// Don't display the form if comments are closed
		if (
			post &&
			post.discussion &&
			post.discussion.comments_open === false &&
			! isCommentableDiscoverPost( post )
		) {
			// If we already have some comments, show a 'comments closed message'
			if ( post.discussion.comment_count && post.discussion.comment_count > 0 ) {
				return <p className="comments__form-closed">{ translate( 'Comments closed.' ) }</p>;
			}

			return null;
		}

		const buttonClasses = classNames( {
			'is-active': this.hasCommentText(),
			'is-visible': this.state.haveFocus || this.hasCommentText(),
		} );

		const expandingAreaClasses = classNames( {
			focused: this.state.haveFocus,
			'expanding-area': true,
		} );

		// How auto expand works for the textarea is covered in this article:
		// http://alistapart.com/article/expanding-text-areas-made-elegant
		return (
			<form className="comments__form" ref="commentForm">
				<fieldset>
					<Gravatar user={ this.props.currentUser } />
					<label>
						<div className={ expandingAreaClasses }>
							<pre>
								<span>{ this.state.commentText }</span>
								<br />
							</pre>
							<AutoDirection>
								<PostCommentFormTextarea
									value={ this.state.commentText }
									placeholder={ translate( 'Enter your comment here…' ) }
									ref={ this.handleTextAreaNode }
									onKeyUp={ this.handleKeyUp }
									onKeyDown={ this.handleKeyDown }
									onFocus={ this.handleFocus }
									onBlur={ this.handleBlur }
									onChange={ this.handleTextChange }
									siteId={ post.site_ID }
								/>
							</AutoDirection>
						</div>
						<button
							ref="commentButton"
							className={ buttonClasses }
							disabled={ this.state.commentText.length === 0 }
							onClick={ this.handleSubmit }
						>
							{ this.props.error ? translate( 'Resend' ) : translate( 'Send' ) }
						</button>
						{ this.renderError() }
					</label>
				</fieldset>
			</form>
		);
	}
}

PostCommentForm.propTypes = {
	post: PropTypes.object.isRequired,
	parentCommentId: PropTypes.number,
	placeholderId: PropTypes.string, // can only be 'placeholder-123'
	commentText: PropTypes.string,
	onUpdateCommentText: PropTypes.func.isRequired,
	onCommentSubmit: PropTypes.func,

	// connect()ed props:
	currentUser: PropTypes.object.isRequired,
	writeComment: PropTypes.func.isRequired,
	deleteComment: PropTypes.func.isRequired,
	replyComment: PropTypes.func.isRequired,
};

PostCommentForm.defaultProps = {
	onCommentSubmit: noop,
};

export default connect(
	state => ( {
		currentUser: getCurrentUser( state ),
	} ),
	{ writeComment, deleteComment, replyComment }
)( PostCommentForm );
