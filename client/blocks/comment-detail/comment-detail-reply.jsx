/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AutoDirection from 'components/auto-direction';
import Gravatar from 'components/gravatar';
import { getCurrentUser } from 'state/current-user/selectors';

const TEXTAREA_HEIGHT_COLLAPSED = 47; // 1 line
const TEXTAREA_HEIGHT_FOCUSED = 68; // 2 lines
const TEXTAREA_MAX_HEIGHT = 236; // 10 lines
const TEXTAREA_VERTICAL_BORDER = 2;

export class CommentDetailReply extends Component {
	state = {
		commentText: '',
		hasFocus: false,
		textareaHeight: TEXTAREA_HEIGHT_COLLAPSED,
	};

	bindTextareaRef = textarea => {
		this.textarea = textarea;
	}

	calculateTextareaHeight = () => {
		const textareaScrollHeight = this.textarea.scrollHeight;
		const textareaHeight = Math.min( TEXTAREA_MAX_HEIGHT, textareaScrollHeight + TEXTAREA_VERTICAL_BORDER );
		return Math.max( TEXTAREA_HEIGHT_FOCUSED, textareaHeight );
	}

	getTextareaPlaceholder = () => {
		const {
			authorDisplayName,
			comment: { status },
			translate,
		} = this.props;

		if ( 'approved' !== status ) {
			return authorDisplayName
				? translate( 'Approve and reply to %(commentAuthor)s…', {
					args: { commentAuthor: authorDisplayName }
				} )
				: translate( 'Approve and reply to comment…' );
		}

		return authorDisplayName
			? translate( 'Reply to %(commentAuthor)s…', {
				args: { commentAuthor: authorDisplayName }
			} )
			: translate( 'Reply to comment…' );
	}

	handleTextChange = event => {
		const { value } = event.target;
		const textareaHeight = this.calculateTextareaHeight();

		this.setState( {
			commentText: value,
			textareaHeight,
		} );
	}

	setFocus = () => this.setState( {
		hasFocus: true,
		textareaHeight: this.calculateTextareaHeight(),
	} );

	submit = () => {
		const {
			comment,
			replyComment,
		} = this.props;
		const { commentText } = this.state;

		replyComment( commentText, comment );
		this.setState( { commentText: '' } );
	}

	submitComment = event => {
		event.preventDefault();
		this.submit();
	}

	submitCommentOnCtrlEnter = event => {
		// Use Ctrl+Enter to submit comment
		if ( event.keyCode === 13 && ( event.ctrlKey || event.metaKey ) ) {
			event.preventDefault();
			this.submit();
		}
	}

	unsetFocus = () => this.setState( {
		hasFocus: false,
		textareaHeight: TEXTAREA_HEIGHT_COLLAPSED,
	} );

	render() {
		const {
			currentUser,
			translate,
		} = this.props;
		const {
			commentText,
			hasFocus,
			textareaHeight,
		} = this.state;

		const hasCommentText = commentText.trim().length > 0;

		// Only show the scrollbar if the textarea content exceeds the max height
		const hasScrollbar = textareaHeight === TEXTAREA_MAX_HEIGHT;

		const buttonClasses = classNames( 'comment-detail__reply-submit', {
			'has-scrollbar': hasScrollbar,
			'is-active': hasCommentText,
			'is-visible': hasFocus || hasCommentText,
		} );

		const gravatarClasses = classNames( { 'is-visible': ! hasFocus } );

		const textareaClasses = classNames( {
			'has-content': hasCommentText,
			'has-focus': hasFocus,
			'has-scrollbar': hasScrollbar,
		} );

		// Without focus, force the textarea to collapse even if it was manually resized
		const textareaStyle = {
			height: hasFocus ? textareaHeight : TEXTAREA_HEIGHT_COLLAPSED,
		};

		return (
			<form className="comment-detail__reply">
				<AutoDirection>
					<textarea
						className={ textareaClasses }
						onBlur={ this.unsetFocus }
						onChange={ this.handleTextChange }
						onFocus={ this.setFocus }
						onKeyDown={ this.submitCommentOnCtrlEnter }
						placeholder={ this.getTextareaPlaceholder() }
						ref={ this.bindTextareaRef }
						style={ textareaStyle }
						value={ commentText }
					/>
				</AutoDirection>

				<Gravatar
					className={ gravatarClasses }
					size={ 24 }
					user={ currentUser }
				/>

				<button
					className={ buttonClasses }
					disabled={ ! hasCommentText }
					onClick={ this.submitComment }
				>
					{ translate( 'Send' ) }
				</button>
			</form>
		);
	}
}

const mapStateToProps = state => ( {
	currentUser: getCurrentUser( state )
} );

export default connect( mapStateToProps )( localize( CommentDetailReply ) );
