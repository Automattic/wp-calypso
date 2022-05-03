import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import classNames from 'classnames';
import { localize, useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { isCommentableDiscoverPost } from 'calypso/blocks/comments/helper';
import AsyncLoad from 'calypso/components/async-load';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import Gravatar from 'calypso/components/gravatar';
import { ProtectFormGuard } from 'calypso/lib/protect-form';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';
import { writeComment, deleteComment, replyComment } from 'calypso/state/comments/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
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
				this.props.onUpdateCommentText( this.props.commentText );
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
		// Update the comment text in the container's state
		this.props.onUpdateCommentText( event.target.value );
	};

	handleSubmit = ( event ) => {
		event.preventDefault();

		const post = this.props.post;
		const commentText = this.props.commentText.trim();

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
	};

	resetCommentText() {
		// Update the comment text in the container's state
		this.props.onUpdateCommentText( '' );
	}

	hasCommentText() {
		return this.props.commentText.trim().length > 0;
	}

	render() {
		const { post, error, errorType, translate } = this.props;

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

		const isReply = !! this.props.parentCommentId;

		const formTextarea = isEnabled( 'reader/gutenberg-for-comments' ) ? (
			<AsyncLoad
				require="./block-editor"
				onChange={ this.handleTextChange }
				siteId={ this.props.post.site_ID }
			/>
		) : (
			<AutoresizingFormTextarea
				value={ this.props.commentText }
				placeholder={ translate( 'Enter your comment here…' ) }
				onKeyUp={ this.handleKeyUp }
				onKeyDown={ this.handleKeyDown }
				onFocus={ this.handleFocus }
				onBlur={ this.handleBlur }
				onChange={ this.handleTextChange }
				enableAutoFocus={ isReply }
			/>
		);

		// How auto expand works for the textarea is covered in this article:
		// http://alistapart.com/article/expanding-text-areas-made-elegant
		return (
			<form className="comments__form">
				<ProtectFormGuard isChanged={ this.hasCommentText() } />
				<FormFieldset>
					<Gravatar user={ this.props.currentUser } />
					{ formTextarea }
					<Button
						className={ buttonClasses }
						disabled={ this.props.commentText.length === 0 }
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

	// connect()ed props:
	currentUser: PropTypes.object.isRequired,
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
	} ),
	{ writeComment, deleteComment, replyComment }
)( localize( PostCommentForm ) );
