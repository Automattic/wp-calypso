/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import AutoDirection from 'components/auto-direction';
import { Button } from '@automattic/components';
import { decodeEntities } from 'lib/formatting';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import { changeCommentStatus, replyComment } from 'state/comments/actions';
import { removeNotice, successNotice } from 'state/notices/actions';
import { getSiteComment } from 'state/comments/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const TEXTAREA_HEIGHT_COLLAPSED = 47; // 1 line
const TEXTAREA_HEIGHT_FOCUSED = 68; // 2 lines
const TEXTAREA_MAX_HEIGHT = 236; // 10 lines
const TEXTAREA_VERTICAL_BORDER = 2;

export class CommentReply extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		commentsListQuery: PropTypes.object,
		isReplyVisible: PropTypes.bool,
	};

	state = {
		hasReplyFocus: false,
		replyContent: '',
		textareaHeight: TEXTAREA_HEIGHT_COLLAPSED,
	};

	componentDidMount() {
		this.textarea.focus();
	}

	componentDidUpdate( prevProps ) {
		if ( ! prevProps.isReplyVisible && this.props.isReplyVisible ) {
			this.textarea.focus();
		}
	}

	storeTextareaRef = ( textarea ) => ( this.textarea = textarea );

	blurReply = () => this.setState( { hasReplyFocus: false } );

	focusReply = () => this.setState( { hasReplyFocus: true } );

	calculateTextareaHeight = () => {
		const textareaHeight = Math.min(
			TEXTAREA_MAX_HEIGHT,
			this.textarea.scrollHeight + TEXTAREA_VERTICAL_BORDER
		);
		return Math.max( TEXTAREA_HEIGHT_FOCUSED, textareaHeight );
	};

	getPlaceholder = () => {
		const { authorDisplayName: commentAuthor, translate } = this.props;
		return commentAuthor
			? translate( 'Reply to %(commentAuthor)s…', { args: { commentAuthor } } )
			: translate( 'Reply to comment…' );
	};

	keyDownHandler = ( event ) => {
		// Use Ctrl+Enter to submit comment
		if ( event.keyCode === 13 && ( event.ctrlKey || event.metaKey ) ) {
			event.preventDefault();
			this.submitReply();
		}
	};

	submit = ( event ) => {
		event.preventDefault();
		this.submitReply();
	};

	submitReply = () => {
		const { approveComment, commentStatus, postId, replyToComment, siteId, translate } = this.props;
		const { replyContent } = this.state;

		this.props.removeNotice( 'comment-notice' );

		const alsoApprove = 'approved' !== commentStatus;

		replyToComment( replyContent, siteId, postId, { alsoApprove } );

		this.props.successNotice(
			alsoApprove
				? translate( 'Comment approved and reply submitted.' )
				: translate( 'Reply submitted.' ),
			{
				id: 'comment-notice',
				isPersistent: true,
			}
		);

		this.setState( { replyContent: '' } );
		this.blurReply();

		if ( alsoApprove ) {
			approveComment( siteId, postId, { previousStatus: commentStatus } );
		}

		// Back navigation scrolling fix
		if ( window ) {
			const path = get( window, 'history.state.path' );
			const newPath = path.replace( /[#].*/, '' );
			window.history.replaceState( window.history.state, '', newPath );
		}
	};

	updateTextarea = ( event ) => {
		const { value: replyContent } = event.target;
		const textareaHeight = this.calculateTextareaHeight();
		this.setState( { replyContent, textareaHeight } );
	};

	render() {
		const { translate } = this.props;
		const { hasReplyFocus, replyContent, textareaHeight } = this.state;

		const hasReplyContent = replyContent.trim().length > 0;
		// Only show the scrollbar if the textarea content exceeds the max height
		const hasScrollbar = textareaHeight === TEXTAREA_MAX_HEIGHT;

		const buttonClasses = classNames( 'comment__reply-submit', {
			'has-scrollbar': hasScrollbar,
			'is-active': hasReplyContent,
		} );

		const textareaClasses = classNames( 'comment__reply-textarea', {
			'has-content': hasReplyContent,
			'has-focus': hasReplyFocus,
			'has-scrollbar': hasScrollbar,
		} );

		// Without focus, force the textarea to collapse even if it was manually resized
		const textareaStyle = {
			height: hasReplyFocus || hasReplyContent ? textareaHeight : TEXTAREA_HEIGHT_COLLAPSED,
		};

		return (
			<form className="comment__reply">
				<AutoDirection>
					<textarea
						className={ textareaClasses }
						onBlur={ this.blurReply }
						onChange={ this.updateTextarea }
						onFocus={ this.focusReply }
						onKeyDown={ this.keyDownHandler }
						placeholder={ this.getPlaceholder() }
						ref={ this.storeTextareaRef }
						style={ textareaStyle }
						value={ replyContent }
					/>
				</AutoDirection>

				<Button
					borderless
					className={ buttonClasses }
					compact
					disabled={ ! hasReplyContent }
					onClick={ this.submit }
					tabIndex="0"
				>
					{ translate( 'Send' ) }
				</Button>
			</form>
		);
	}
}

const mapStateToProps = ( state, { commentId } ) => {
	const siteId = getSelectedSiteId( state );
	const comment = getSiteComment( state, siteId, commentId );

	return {
		authorDisplayName: decodeEntities( get( comment, 'author.name' ) ),
		commentStatus: get( comment, 'status' ),
		postId: get( comment, 'post.ID' ),
		siteId,
	};
};

const mapDispatchToProps = ( dispatch, { commentId, commentsListQuery } ) => ( {
	approveComment: ( siteId, postId, analytics = {} ) =>
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_comment_management_change_status', {
						also_unlike: false,
						is_undo: false,
						previous_status: analytics.previousStatus,
						status: 'approved',
					} ),
					bumpStat( 'calypso_comment_management', 'comment_status_changed_to_approved' )
				),
				changeCommentStatus( siteId, postId, commentId, 'approved' )
			)
		),
	removeNotice: ( noticeId ) => dispatch( removeNotice( noticeId ) ),
	replyToComment: ( replyContent, siteId, postId, analytics = { alsoApprove: false } ) =>
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_comment_management_reply', {
						also_approve: analytics.alsoApprove,
					} ),
					bumpStat( 'calypso_comment_management', 'comment_reply' )
				),
				replyComment( replyContent, siteId, postId, commentId, commentsListQuery )
			)
		),
	successNotice: ( text, options ) => dispatch( successNotice( text, options ) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentReply ) );
