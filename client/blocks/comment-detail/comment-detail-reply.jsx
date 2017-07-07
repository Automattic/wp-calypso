/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import AutoDirection from 'components/auto-direction';
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
		const { authorDisplayName, commentStatus, translate } = this.props;

		if ( 'approved' !== commentStatus ) {
			return authorDisplayName
				? translate( 'Approve and reply to %(commentAuthor)s…', {
					args: { commentAuthor: authorDisplayName }
				} )
				: 'Approve and reply to comment…';
		}

		return authorDisplayName
			? translate( 'Reply to %(commentAuthor)s…', {
				args: { commentAuthor: authorDisplayName }
			} )
			: 'Reply to comment…';
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
			commentId,
			commentStatus,
			currentUser,
			postId,
			postTitle,
			postUrl,
			submitComment,
		} = this.props;
		const { commentText } = this.state;

		const comment = {
			authorAvatarUrl: get( currentUser, 'avatar_URL', '' ),
			authorName: get( currentUser, 'display_name', '' ),
			authorUrl: get( currentUser, 'primary_blog_url', '' ),
			parentId: commentId,
			postId: postId,
			postTitle: postTitle,
			content: commentText,
			URL: postUrl,
		};
		submitComment( comment, { alsoApprove: 'approved' !== commentStatus } );
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
		const { translate } = this.props;
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
		} );

		const textareaClasses = classNames( {
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
				{ ( hasFocus || hasCommentText ) &&
					<button
						className={ buttonClasses }
						disabled={ ! hasCommentText }
						onClick={ this.submitComment }
					>
						{ translate( 'Send' ) }
					</button>
				}
			</form>
		);
	}
}

const mapStateToProps = state => ( {
	currentUser: getCurrentUser( state )
} );

export default connect( mapStateToProps )( localize( CommentDetailReply ) );
