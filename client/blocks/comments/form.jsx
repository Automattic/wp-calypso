/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { isEnabled } from '@automattic/calypso-config';
import AutoresizingFormTextarea from './autoresizing-form-textarea';
import AsyncLoad from 'calypso/components/async-load';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import Gravatar from 'calypso/components/gravatar';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { writeComment, deleteComment, replyComment } from 'calypso/state/comments/actions';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';
import { isCommentableDiscoverPost } from 'calypso/blocks/comments/helper';
import { ProtectFormGuard } from 'calypso/lib/protect-form';

/**
 * Style dependencies
 */
import './form.scss';

const noop = () => {};

class PostCommentForm extends React.Component {
	constructor( props ) {
		super();

		this.state = {
			commentText: props.commentText || '',
			haveFocus: false,
		};

		// bind event handlers to this instance
		Object.getOwnPropertyNames( PostCommentForm.prototype )
			.filter( ( prop ) => prop.indexOf( 'handle' ) === 0 )
			.filter( ( prop ) => typeof this[ prop ] === 'function' )
			.forEach( ( prop ) => ( this[ prop ] = this[ prop ].bind( this ) ) );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		this.setState( {
			commentText: nextProps.commentText || '',
		} );
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

	handleTextChange( commentText ) {
		this.setState( { commentText } );

		// Update the comment text in the container's state
		this.props.onUpdateCommentText( commentText );
	}

	handleTextChangeEvent = ( event ) => {
		this.handleTextChange( event.target.value );
	};

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

		const isReply = !! this.props.parentCommentId;

		const formTextarea = isEnabled( 'reader/gutenberg-for-comments' ) ? (
			<AsyncLoad
				require="./block-editor"
				onChange={ this.handleTextChange }
				siteId={ this.props.post.site_ID }
			/>
		) : (
			<AutoresizingFormTextarea
				value={ this.state.commentText }
				placeholder={ translate( 'Enter your comment here…' ) }
				onKeyUp={ this.handleKeyUp }
				onKeyDown={ this.handleKeyDown }
				onFocus={ this.handleFocus }
				onBlur={ this.handleBlur }
				onChange={ this.handleTextChangeEvent }
				siteId={ this.props.post.site_ID }
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
						disabled={ this.state.commentText.length === 0 }
						onClick={ this.handleSubmit }
					>
						{ this.props.error ? translate( 'Resend' ) : translate( 'Send' ) }
					</Button>
					{ this.renderError() }
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
	onCommentSubmit: noop,
};

export default connect(
	( state ) => ( {
		currentUser: getCurrentUser( state ),
	} ),
	{ writeComment, deleteComment, replyComment }
)( PostCommentForm );
