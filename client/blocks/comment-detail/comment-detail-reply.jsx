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

export class CommentDetailReply extends Component {
	state = {
		commentText: '',
		hasFocus: false,
	};

	handleTextChange = event => this.setState( { commentText: event.target.value } );

	setFocus = () => this.setState( { hasFocus: true } );

	submit = () => {
		const {
			commentId,
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
		submitComment( comment );
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

	unsetFocus = () => this.setState( { hasFocus: false } );

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
							onBlur={ this.unsetFocus }
							onChange={ this.handleTextChange }
							onFocus={ this.setFocus }
							onKeyDown={ this.submitCommentOnCtrlEnter }
							placeholder={ translate( 'Enter your comment here…' ) }
							value={ commentText }
						/>
					</AutoDirection>
					<button
						className={ buttonClasses }
						disabled={ ! hasCommentText }
						onClick={ this.submitComment }
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
