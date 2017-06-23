/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import AutoDirection from 'components/auto-direction';

export class CommentDetailReply extends Component {
	state = {
		commentText: '',
		haveFocus: false,
	};

	handleBlur = () => this.setState( { haveFocus: false } );

	handleFocus = () => this.setState( { haveFocus: true } );

	handleKeyDown = event => {
		// Use Ctrl+Enter to submit comment
		if ( event.keyCode === 13 && ( event.ctrlKey || event.metaKey ) ) {
			event.preventDefault();
			this.submit();
		}
	}

	handleSubmit = event => {
		event.preventDefault();
		this.submit();
	}

	handleTextChange = event => this.setState( { commentText: event.target.value } );

	submit = () => {
		this.setState( { commentText: '' } );
	}

	render() {
		const { translate } = this.props;
		const { commentText, haveFocus } = this.state;

		const hasCommentText = commentText.trim().length > 0;

		const buttonClasses = classNames( 'comment-detail__reply-submit', {
			'is-active': hasCommentText,
			'is-visible': haveFocus || hasCommentText,
		} );

		const expandingAreaClasses = classNames( 'expanding-area', {
			focused: haveFocus,
		} );

		return (
			<form className="comment-detail__reply">
				<div className={ expandingAreaClasses }>
					<pre><span>{ commentText }</span><br /></pre>
					<AutoDirection>
						<textarea
							onBlur={ this.handleBlur }
							onChange={ this.handleTextChange }
							onFocus={ this.handleFocus }
							onKeyDown={ this.handleKeyDown }
							placeholder={ translate( 'Enter your comment here…' ) }
							value={ commentText }
						/>
					</AutoDirection>
					<button
						className={ buttonClasses }
						disabled={ ! hasCommentText }
						onClick={ this.handleSubmit }
					>
						{ translate( 'Send' ) }
					</button>
				</div>
			</form>
		);
	}
}

export default localize( CommentDetailReply );
