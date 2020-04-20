/**
 * External depedencies
 *
 */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { createReviewReply } from 'woocommerce/state/sites/review-replies/actions';
import { getCurrentUser } from 'state/current-user/selectors';
import Gravatar from 'components/gravatar';
import { successNotice } from 'state/notices/actions';

// Matches comments reply box heights
const TEXTAREA_HEIGHT_COLLAPSED = 47; // 1 line
const TEXTAREA_HEIGHT_FOCUSED = 68; // 2 lines
const TEXTAREA_MAX_HEIGHT = 236; // 10 lines
const TEXTAREA_VERTICAL_BORDER = 2;

class ReviewReplyCreate extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		review: PropTypes.shape( {
			status: PropTypes.string,
		} ).isRequired,
	};

	// TODO Update this to use Redux edits state for creates at some point. Unfortunately it only supports holding one at a time,
	// so we will use internal component state to hold the text for now.
	state = {
		commentText: '',
		hasFocus: false,
		textareaHeight: TEXTAREA_HEIGHT_COLLAPSED,
	};

	bindTextareaRef = ( textarea ) => {
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
		const { review, translate } = this.props;
		if ( 'approved' === review.status ) {
			return translate( 'Reply to %(reviewAuthor)s…', { args: { reviewAuthor: review.name } } );
		}
		return translate( 'Approve and reply to %(reviewAuthor)s…', {
			args: { reviewAuthor: review.name },
		} );
	};

	onTextChange = ( event ) => {
		const { value } = event.target;

		const textareaHeight = this.calculateTextareaHeight();
		this.setState( {
			commentText: value,
			textareaHeight,
		} );
	};

	setFocus = () =>
		this.setState( {
			hasFocus: true,
			textareaHeight: this.calculateTextareaHeight(),
		} );

	unsetFocus = () =>
		this.setState( {
			hasFocus: false,
			textareaHeight: TEXTAREA_HEIGHT_COLLAPSED,
		} );

	onSubmit = ( event ) => {
		event.preventDefault();
		const { siteId, review, translate } = this.props;
		const { commentText } = this.state;
		const { product } = review;

		const shouldApprove = 'pending' === review.status ? true : false;

		this.props.createReviewReply( siteId, product.id, review.id, commentText, shouldApprove );

		this.setState( {
			commentText: '',
		} );

		this.props.successNotice( translate( 'Reply submitted.' ), { duration: 5000 } );
	};

	render() {
		const { translate, currentUser } = this.props;
		const { hasFocus, textareaHeight, commentText } = this.state;

		const hasCommentText = commentText.trim().length > 0;

		// Only show the scrollbar if the textarea content exceeds the max height
		const hasScrollbar = textareaHeight >= TEXTAREA_MAX_HEIGHT;

		const buttonClasses = classNames( 'reviews__reply-submit', {
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
			<form className="reviews__reply-textarea">
				<textarea
					className={ textareaClasses }
					onBlur={ this.unsetFocus }
					onChange={ this.onTextChange }
					onFocus={ this.setFocus }
					placeholder={ this.getTextareaPlaceholder() }
					ref={ this.bindTextareaRef }
					style={ textareaStyle }
					value={ commentText }
				/>

				<Gravatar className={ gravatarClasses } size={ 24 } user={ currentUser } />

				<button className={ buttonClasses } disabled={ ! hasCommentText } onClick={ this.onSubmit }>
					{ translate( 'Send' ) }
				</button>
			</form>
		);
	}
}

function mapStateToProps( state ) {
	return {
		currentUser: getCurrentUser( state ),
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			createReviewReply,
			successNotice,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ReviewReplyCreate ) );
