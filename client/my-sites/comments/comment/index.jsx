/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import ReactDom from 'react-dom';
import { get, isEqual, isUndefined } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CommentActions from 'my-sites/comments/comment/comment-actions';
import CommentContent from 'my-sites/comments/comment/comment-content';
import CommentEdit from 'my-sites/comments/comment/comment-edit';
import CommentHeader from 'my-sites/comments/comment/comment-header';
import CommentReply from 'my-sites/comments/comment/comment-reply';
import QueryComment from 'components/data/query-comment';
import { getMinimumComment } from 'my-sites/comments/comment/utils';
import { getSiteComment } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

export class Comment extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		commentId: PropTypes.number,
		isBulkMode: PropTypes.bool,
		isPostView: PropTypes.bool,
		isSelected: PropTypes.bool,
		redirect: PropTypes.func,
		refreshCommentData: PropTypes.bool,
		toggleSelected: PropTypes.func,
		updateLastUndo: PropTypes.func,
	};

	state = {
		isEditMode: false,
		isReplyVisible: false,
	};

	componentWillReceiveProps( nextProps ) {
		const { isBulkMode: wasBulkMode } = this.props;
		const { isBulkMode } = nextProps;

		this.setState( ( { isEditMode, isReplyVisible } ) => ( {
			isEditMode: wasBulkMode !== isBulkMode ? false : isEditMode,
			isReplyVisible: wasBulkMode !== isBulkMode ? false : isReplyVisible,
		} ) );
	}

	shouldComponentUpdate = ( nextProps, nextState ) =>
		! isEqual( this.props, nextProps ) || ! isEqual( this.state, nextState );

	storeCardRef = card => ( this.commentCard = card );

	keyDownHandler = event => {
		const { isBulkMode } = this.props;
		const commentHasFocus =
			document &&
			this.commentCard &&
			document.activeElement === ReactDom.findDOMNode( this.commentCard );

		if ( ! isBulkMode || ! commentHasFocus ) {
			return;
		}

		switch ( event.keyCode ) {
			case 13: // enter
			case 32: // space
				event.preventDefault();
				return this.toggleSelected();
		}
	};

	toggleEditMode = () => {
		this.setState( ( { isEditMode } ) => ( {
			isEditMode: ! isEditMode,
			isReplyVisible: false,
		} ) );
	};

	toggleReply = () =>
		this.setState( ( { isReplyVisible } ) => ( { isReplyVisible: ! isReplyVisible } ) );

	toggleSelected = () => this.props.toggleSelected( this.props.minimumComment );

	render() {
		const {
			siteId,
			postId,
			commentId,
			commentIsPending,
			isBulkMode,
			isLoading,
			isPostView,
			isSelected,
			redirect,
			refreshCommentData,
			updateLastUndo,
		} = this.props;
		const { isEditMode, isReplyVisible } = this.state;

		const classes = classNames( 'comment', {
			'is-bulk-mode': isBulkMode,
			'is-edit-mode': isEditMode,
			'is-placeholder': isLoading,
			'is-pending': commentIsPending,
			'is-reply-visible': isReplyVisible,
		} );

		return (
			<Card
				className={ classes }
				onClick={ isBulkMode ? this.toggleSelected : undefined }
				onKeyDown={ this.keyDownHandler }
				ref={ this.storeCardRef }
			>
				{ refreshCommentData && (
					<QueryComment commentId={ commentId } siteId={ siteId } forceWpcom />
				) }

				{ ! isEditMode && (
					<div className="comment__detail">
						<CommentHeader { ...{ commentId, isBulkMode, isEditMode, isPostView, isSelected } } />

						<CommentContent { ...{ commentId, isBulkMode, isPostView } } />

						{ ! isBulkMode && (
							<CommentActions
								{ ...{ siteId, postId, commentId, redirect, updateLastUndo } }
								toggleEditMode={ this.toggleEditMode }
								toggleReply={ this.toggleReply }
							/>
						) }

						{ ! isBulkMode && <CommentReply { ...{ commentId, isReplyVisible } } /> }
					</div>
				) }

				{ isEditMode && (
					<CommentEdit { ...{ commentId } } toggleEditMode={ this.toggleEditMode } />
				) }
			</Card>
		);
	}
}

const mapStateToProps = ( state, { commentId } ) => {
	const siteId = getSelectedSiteId( state );
	const comment = getSiteComment( state, siteId, commentId );
	const commentStatus = get( comment, 'status' );
	return {
		siteId,
		postId: get( comment, 'post.ID' ),
		commentIsPending: 'unapproved' === commentStatus,
		isLoading: isUndefined( comment ),
		minimumComment: getMinimumComment( comment ),
	};
};

export default connect( mapStateToProps )( Comment );
