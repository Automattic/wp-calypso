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
import { getCurrentUser } from 'state/current-user/selectors';

export class CommentDetailReply extends Component {
	state = {
		commentText: '',
		hasFocus: false,
	};

	handleBlur = () => this.setState( { hasFocus: false } );

	handleFocus = () => this.setState( { hasFocus: true } );

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
		const comment = {
			authorAvatarUrl: this.props.currentUser.avatar_URL,
			authorName: this.props.currentUser.display_name,
			authorUrl: this.props.currentUser.primary_blog_url,
			parentId: this.props.commentId,
			postTitle: this.props.postTitle,
			content: this.state.commentText,
			URL: this.props.postUrl,
		};
		this.props.submitComment( comment );
		this.setState( { commentText: '' } );
	}

	render() {
		const { translate } = this.props;
		const { commentText, hasFocus } = this.state;

		const hasCommentText = commentText.trim().length > 0;

		const buttonClasses = classNames( 'comment-detail__reply-submit', {
			'is-active': hasCommentText,
			'is-visible': hasFocus || hasCommentText,
		} );

		const expandingAreaClasses = classNames( 'is-expanding-area', {
			'is-focused': hasFocus,
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

const mapStateToProps = state => ( {
	currentUser: getCurrentUser( state )
} );

export default connect( mapStateToProps )( localize( CommentDetailReply ) );
