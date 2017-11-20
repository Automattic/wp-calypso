/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

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
		textareaHeight: TEXTAREA_HEIGHT_COLLAPSED,
	};

	componentDidMount() {
		if ( this.props.hasFocus ) {
			this.textarea.focus();
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.hasFocus !== nextProps.hasFocus ) {
			this.setState( {
				textareaHeight: nextProps.hasFocus
					? this.calculateTextareaHeight()
					: TEXTAREA_HEIGHT_COLLAPSED,
			} );
		}
	}

	bindTextareaRef = textarea => {
		this.textarea = textarea;
	};

	calculateTextareaHeight = () => {
		const textareaScrollHeight = this.textarea.scrollHeight;
		const textareaHeight = Math.min(
			TEXTAREA_MAX_HEIGHT,
			textareaScrollHeight + TEXTAREA_VERTICAL_BORDER
		);
		return Math.max( TEXTAREA_HEIGHT_FOCUSED, textareaHeight );
	};

	getTextareaPlaceholder = () => {
		const { authorDisplayName, translate } = this.props;

		return authorDisplayName
			? translate( 'Reply to %(commentAuthor)s…', {
					args: { commentAuthor: authorDisplayName },
				} )
			: translate( 'Reply to comment…' );
	};

	onChange = event => {
		const { value } = event.target;
		const textareaHeight = this.calculateTextareaHeight();

		this.setState( {
			commentText: value,
			textareaHeight,
		} );
	};

	submit = () => {
		const { comment, replyComment } = this.props;
		const { commentText } = this.state;

		replyComment( commentText, comment );
		this.setState( { commentText: '' } );
	};

	submitComment = event => {
		event.preventDefault();
		this.submit();
	};

	onKeyDown = event => {
		// Use Ctrl+Enter to submit comment
		if ( event.keyCode === 13 && ( event.ctrlKey || event.metaKey ) ) {
			event.preventDefault();
			this.submit();
		}
	};

	render() {
		const { currentUser, hasFocus, translate, enterReplyState, exitReplyState } = this.props;
		const { commentText, textareaHeight } = this.state;

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
						onBlur={ exitReplyState }
						onChange={ this.onChange }
						onFocus={ enterReplyState }
						onKeyDown={ this.onKeyDown }
						placeholder={ this.getTextareaPlaceholder() }
						ref={ this.bindTextareaRef }
						style={ textareaStyle }
						value={ commentText }
					/>
				</AutoDirection>

				<Gravatar className={ gravatarClasses } size={ 24 } user={ currentUser } />

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
	currentUser: getCurrentUser( state ),
} );

export default connect( mapStateToProps )( localize( CommentDetailReply ) );
