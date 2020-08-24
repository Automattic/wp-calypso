/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { noop } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AutoDirection from 'components/auto-direction';
import Notice from 'components/notice';
import { editComment } from 'state/comments/actions';
import { recordAction, recordGaEvent } from 'reader/stats';
import PostCommentFormTextarea from './form-textarea';

/**
 * Style dependencies
 */
import './comment-edit-form.scss';

class PostCommentForm extends Component {
	constructor( props ) {
		super();

		this.state = {
			commentText: props.commentText || '',
			haveFocus: false,
		};
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		this.setState( {
			commentText: nextProps.commentText || '',
		} );
	}

	handleSubmit = ( event ) => {
		event.preventDefault();
		this.submit();
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
				// remove the comment
				this.props.deleteComment(
					this.props.post.site_ID,
					this.props.post.ID,
					this.props.placeholderId
				);
			}
		}
	};

	handleFocus = () => this.setState( { haveFocus: true } );

	handleTextChange = ( event ) => {
		const commentText = event.target.value;

		this.setState( { commentText } );
	};

	resetCommentText = () => {
		this.setState( { commentText: '' } );
	};

	hasCommentText = () => {
		return this.state.commentText.trim().length > 0;
	};

	submit() {
		const post = this.props.post;
		const commentText = this.state.commentText.trim();

		if ( ! commentText ) {
			this.resetCommentText(); // Clean up any newlines
			return false;
		}

		this.props.editComment( post.site_ID, post.ID, this.props.commentId, { content: commentText } );

		recordAction( 'edited_comment' );
		recordGaEvent( 'Clicked Edit Comment Button' );

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
				message = translate(
					"Duplicate comment detected. It looks like you've already said that!"
				);
				break;

			default:
				message = translate( 'Sorry - there was a problem posting your comment.' );
				break;
		}

		return (
			<Notice
				text={ message }
				className="comments__notice"
				showDismiss={ false }
				status="is-error"
			/>
		);
	}

	render() {
		const buttonClasses = classNames( {
			'is-active': this.hasCommentText(),
			'is-visible': this.state.haveFocus || this.hasCommentText(),
		} );

		const expandingAreaClasses = classNames( {
			focused: this.state.haveFocus,
			'expanding-area': true,
		} );

		const isReply = !! this.props.parentCommentId;

		// How auto expand works for the textarea is covered in this article:
		// http://alistapart.com/article/expanding-text-areas-made-elegant
		return (
			<form className="comments__edit-form">
				<fieldset>
					<div className={ expandingAreaClasses }>
						<pre>
							<span>{ this.state.commentText }</span>
							<br />
						</pre>
						<AutoDirection>
							<PostCommentFormTextarea
								value={ this.state.commentText }
								onKeyUp={ this.handleKeyUp }
								onKeyDown={ this.handleKeyDown }
								onFocus={ this.handleFocus }
								onBlur={ this.handleBlur }
								onChange={ this.handleTextChange }
								enableAutoFocus={ isReply }
							/>
						</AutoDirection>
					</div>
					<button
						className={ buttonClasses }
						disabled={ this.state.commentText.length === 0 }
						onClick={ this.handleSubmit }
					>
						{ translate( 'Send' ) }
					</button>
					{ this.renderError() }
				</fieldset>
			</form>
		);
	}
}

PostCommentForm.propTypes = {
	post: PropTypes.object.isRequired,
	commentId: PropTypes.number,
	commentText: PropTypes.string,
	onCommentSubmit: PropTypes.func,

	// connect()ed props:
	editComment: PropTypes.func.isRequired,
};

PostCommentForm.defaultProps = {
	onCommentSubmit: noop,
};

const mapDispatchToProps = ( dispatch ) => bindActionCreators( { editComment }, dispatch );

export default connect( null, mapDispatchToProps )( PostCommentForm );
