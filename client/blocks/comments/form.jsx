import { Button, FormInputValidation } from '@automattic/components';
import clsx from 'clsx';
import { localize, useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import Gravatar from 'calypso/components/gravatar';
import { ProtectFormGuard } from 'calypso/lib/protect-form';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';
import { writeComment, deleteComment, replyComment } from 'calypso/state/comments/actions';
import { getCurrentUser, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import AutoresizingFormTextarea from './autoresizing-form-textarea';

import './form.scss';

const noop = () => {};

function PostCommentFormError( { type } ) {
	const translate = useTranslate();

	const message =
		type === 'comment_duplicate'
			? translate( "Duplicate comment detected. It looks like you've already said that!" )
			: translate( 'Sorry - there was a problem posting your comment.' );

	return <FormInputValidation isError text={ message } />;
}

class PostCommentForm extends Component {
	state = {
		haveFocus: false,
	};

	handleKeyDown = ( event ) => {
		// Use Ctrl+Enter to submit comment
		if ( event.keyCode === 13 && ( event.ctrlKey || event.metaKey ) ) {
			event.preventDefault();
			this.submit();
		}

		// Use ESC to remove the erroneous comment placeholder and just start over
		if ( event.keyCode === 27 ) {
			if ( this.props.placeholderId ) {
				// sync the text to the upper level so it won't be lost
				this.props.onUpdateCommentText( this.getCommentText() );
				// remove the comment
				this.props.deleteComment(
					this.props.post.site_ID,
					this.props.post.ID,
					this.props.placeholderId
				);
			}
		}
	};

	handleFocus = () => {
		this.setState( { haveFocus: true } );
	};

	handleTextChange = ( event ) => {
		if ( ! this.props.isLoggedIn ) {
			return this.props.registerLastActionRequiresLogin( {
				type: 'comment',
				siteId: this.props.post.site_ID,
				postId: this.props.post.ID,
				commentId: this.props.placeholderId,
			} );
		}
		// Update the comment text in the container's state
		this.props.onUpdateCommentText( event.target.value );
	};

	handleSubmit = ( event ) => {
		event.preventDefault();

		const post = this.props.post;
		const commentText = this.getCommentText().trim();

		if ( ! commentText ) {
			this.resetCommentText(); // Clean up any newlines
			return false;
		}

		// Do not submit form if the user is not logged in
		if ( ! this.props.isLoggedIn ) {
			return this.props.registerLastActionRequiresLogin( {
				type: 'comment-submit',
				siteId: this.props.post.site_ID,
				postId: this.props.post.ID,
				commentId: this.props.placeholderId,
				commentText: commentText,
			} );
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
			is_inline_comment: this.props.isInlineComment,
		} );

		this.resetCommentText();

		// Resets the active reply comment in PostCommentList
		this.props.onCommentSubmit();

		return true;
	};

	resetCommentText() {
		// Update the comment text in the container's state
		this.props.onUpdateCommentText( '' );
	}

	getCommentText() {
		return this.props.commentText ?? '';
	}

	hasCommentText() {
		return this.getCommentText().trim().length > 0;
	}

	render() {
		const { post, error, errorType, translate } = this.props;

		// Don't display the form if comments are closed
		if ( post && post.discussion && post.discussion.comments_open === false ) {
			// If we already have some comments, show a 'comments closed message'
			if ( post.discussion.comment_count && post.discussion.comment_count > 0 ) {
				return <p className="comments__form-closed">{ translate( 'Comments closed.' ) }</p>;
			}

			return null;
		}

		const buttonClasses = clsx( {
			'is-active': this.hasCommentText(),
			'is-visible': this.state.haveFocus || this.hasCommentText(),
		} );

		const isReply = !! this.props.parentCommentId;

		// How auto expand works for the textarea is covered in this article:
		// http://alistapart.com/article/expanding-text-areas-made-elegant
		return (
			<form className="comments__form">
				<ProtectFormGuard isChanged={ this.hasCommentText() } />
				<FormFieldset>
					<Gravatar user={ this.props.currentUser } />
					<AutoresizingFormTextarea
						value={ this.getCommentText() }
						placeholder={ translate( 'Add a comment…' ) }
						onKeyUp={ this.handleKeyUp }
						onKeyDown={ this.handleKeyDown }
						onFocus={ this.handleFocus }
						onBlur={ this.handleBlur }
						onChange={ this.handleTextChange }
						enableAutoFocus={ isReply }
						siteId={ post.site_ID }
					/>
					<Button
						className={ buttonClasses }
						disabled={ this.getCommentText().length === 0 }
						onClick={ this.handleSubmit }
					>
						{ this.props.error ? translate( 'Resend' ) : translate( 'Send' ) }
					</Button>
					{ error && <PostCommentFormError type={ errorType } /> }
				</FormFieldset>
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
	isInlineComment: PropTypes.bool,
	isLogedIn: PropTypes.bool,

	// connect()ed props:
	currentUser: PropTypes.object,
	writeComment: PropTypes.func.isRequired,
	deleteComment: PropTypes.func.isRequired,
	replyComment: PropTypes.func.isRequired,
};

PostCommentForm.defaultProps = {
	commentText: '',
	onCommentSubmit: noop,
};

export default connect(
	( state ) => ( {
		currentUser: getCurrentUser( state ),
		isLoggedIn: isUserLoggedIn( state ),
	} ),
	{ writeComment, deleteComment, replyComment, registerLastActionRequiresLogin }
)( localize( PostCommentForm ) );
