/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import ReactDom from 'react-dom';
import { get, isUndefined } from 'lodash';

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
		commentId: PropTypes.number,
		isBulkMode: PropTypes.bool,
		isPersistent: PropTypes.bool,
		isPostView: PropTypes.bool,
		isSelected: PropTypes.bool,
		refreshCommentData: PropTypes.bool,
		toggleSelected: PropTypes.func,
		updateLastUndo: PropTypes.func,
	};

	state = {
		isEditMode: false,
		isExpanded: false,
		isReplyVisible: false,
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.isBulkMode && ! this.props.isBulkMode ) {
			this.setState( { isExpanded: false } );
		}
	}

	storeCardRef = card => ( this.commentCard = card );

	keyDownHandler = event => {
		const { isBulkMode } = this.props;
		const { isEditMode, isExpanded } = this.state;

		const commentHasFocus =
			document &&
			this.commentCard &&
			document.activeElement === ReactDom.findDOMNode( this.commentCard );

		if ( isEditMode || ( isExpanded && ! commentHasFocus ) ) {
			return;
		}

		switch ( event.keyCode ) {
			case 13: // enter
			case 32: // space
				event.preventDefault();
				return isBulkMode ? this.toggleSelected() : this.toggleExpanded();
		}
	};

	toggleEditMode = () =>
		this.setState( ( { isEditMode } ) => ( {
			isEditMode: ! isEditMode,
			isExpanded: ! isEditMode,
			isReplyVisible: false,
		} ) );

	toggleExpanded = () => {
		if ( ! this.props.isLoading && ! this.state.isEditMode ) {
			this.setState( ( { isExpanded } ) => ( {
				isExpanded: ! isExpanded,
				isReplyVisible: false,
			} ) );
		}
	};

	toggleReply = () =>
		this.setState( ( { isReplyVisible } ) => ( {
			isExpanded: true,
			isReplyVisible: ! isReplyVisible,
		} ) );

	toggleSelected = () => this.props.toggleSelected( this.props.minimumComment );

	render() {
		const {
			commentId,
			commentIsPending,
			isBulkMode,
			isLoading,
			isPostView,
			isSelected,
			refreshCommentData,
			siteId,
			updateLastUndo,
		} = this.props;
		const { isEditMode, isExpanded, isReplyVisible } = this.state;

		const showActions = isExpanded || ( ! isBulkMode && commentIsPending );

		const classes = classNames( 'comment', {
			'is-bulk-mode': isBulkMode,
			'is-collapsed': ! isExpanded,
			'is-edit-mode': isEditMode,
			'is-expanded': isExpanded,
			'is-placeholder': isLoading,
			'is-pending': commentIsPending,
			'is-reply-visible': isReplyVisible,
		} );

		return (
			<Card
				className={ classes }
				onClick={ isBulkMode ? this.toggleSelected : false }
				onKeyDown={ this.keyDownHandler }
				ref={ this.storeCardRef }
				tabIndex="0"
			>
				{ refreshCommentData && (
					<QueryComment commentId={ commentId } siteId={ siteId } forceWpcom />
				) }

				{ ! isEditMode && (
					<div className="comment__detail">
						<CommentHeader
							{ ...{ commentId, isBulkMode, isEditMode, isExpanded, isPostView, isSelected } }
							toggleExpanded={ this.toggleExpanded }
						/>

						<CommentContent { ...{ commentId, isExpanded, isPostView } } />

						{ showActions && (
							<CommentActions
								{ ...{ commentId, updateLastUndo } }
								toggleEditMode={ this.toggleEditMode }
								toggleReply={ this.toggleReply }
							/>
						) }

						{ isExpanded && ! isBulkMode && <CommentReply { ...{ commentId, isReplyVisible } } /> }
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
		commentIsPending: 'unapproved' === commentStatus,
		isLoading: isUndefined( comment ),
		minimumComment: getMinimumComment( comment ),
		siteId,
	};
};

export default connect( mapStateToProps )( Comment );
