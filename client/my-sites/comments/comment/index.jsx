/**
 * External dependencies
 */
import { isWithinBreakpoint } from '@automattic/viewport';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import ReactDom from 'react-dom';
import { debounce, get, isEqual, isUndefined } from 'lodash';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { Card } from '@automattic/components';
import CommentActions from 'my-sites/comments/comment/comment-actions';
import CommentContent from 'my-sites/comments/comment/comment-content';
import CommentEdit from 'my-sites/comments/comment/comment-edit';
import CommentHeader from 'my-sites/comments/comment/comment-header';
import CommentReply from 'my-sites/comments/comment/comment-reply';
import CommentRepliesList from 'my-sites/comments/comment-replies-list';
import QueryComment from 'components/data/query-comment';
import scrollTo from 'lib/scroll-to';
import { getMinimumComment } from 'my-sites/comments/comment/utils';
import { getSiteComment } from 'state/comments/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export class Comment extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		commentId: PropTypes.number,
		commentsListQuery: PropTypes.object,
		isAtMaxDepth: PropTypes.bool,
		isBulkMode: PropTypes.bool,
		isEditMode: PropTypes.bool,
		isPostView: PropTypes.bool,
		isSelected: PropTypes.bool,
		redirect: PropTypes.func,
		refreshCommentData: PropTypes.bool,
		toggleSelected: PropTypes.func,
		updateLastUndo: PropTypes.func,
	};

	constructor( props ) {
		super( props );

		this.state = {
			isEditMode: props.isEditMode,
			isReplyVisible: false,
			offsetTop: 0,
		};
	}

	UNSAFE_componentWillMount() {
		this.debounceScrollToOffset = debounce( this.scrollToOffset, 100 );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { isBulkMode: wasBulkMode, isPostView: wasPostView } = this.props;
		const { isBulkMode, isPostView } = nextProps;

		const offsetTop =
			wasPostView !== isPostView || `#comment-${ this.props.commentId }` !== window.location.hash
				? 0
				: this.getCommentOffsetTop();

		this.setState( ( { isEditMode, isReplyVisible } ) => ( {
			isEditMode: wasBulkMode !== isBulkMode ? false : isEditMode,
			isReplyVisible: wasBulkMode !== isBulkMode ? false : isReplyVisible,
			offsetTop,
		} ) );
	}

	componentDidUpdate( prevProps, prevState ) {
		if ( prevState.offsetTop !== this.state.offsetTop ) {
			this.debounceScrollToOffset( this.state.offsetTop );
		}
	}

	shouldComponentUpdate = ( nextProps, nextState ) =>
		! isEqual( this.props, nextProps ) || ! isEqual( this.state, nextState );

	storeCardRef = ( card ) => ( this.commentCard = card );

	keyDownHandler = ( event ) => {
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

	getCommentOffsetTop = () => {
		if ( ! window ) {
			return 0;
		}

		const { isPostView } = this.props;
		const { offsetTop } = this.state;

		// On >660px, adjust the comment card `offsetTop` to avoid being covered by the masterbar.
		// 56px = 48px (masterbar height) + 8px (comment card vertical margin)
		// 66px = 58px (post view sticky header) + 8px (comment card vertical margin)
		const offsetAdjustment = ~~isWithinBreakpoint( '>660px' ) && 56 - ( isPostView && 66 );

		const commentNode = ReactDom.findDOMNode( this.commentCard );
		const newOffsetTop = commentNode.offsetTop;

		return newOffsetTop > offsetAdjustment && newOffsetTop > offsetTop
			? newOffsetTop - offsetAdjustment
			: offsetTop;
	};

	scrollToOffset = () => {
		if ( ! window || `#comment-${ this.props.commentId }` !== window.location.hash ) {
			return;
		}
		const { offsetTop } = this.state;
		scrollTo( { x: 0, y: offsetTop } );
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
			commentsListQuery,
			isAtMaxDepth,
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
			'is-at-max-depth': isAtMaxDepth,
			'is-bulk-mode': isBulkMode,
			'is-edit-mode': isEditMode,
			'is-placeholder': isLoading,
			'is-pending': commentIsPending,
			'is-reply-visible': isReplyVisible,
		} );

		return (
			<Card
				className={ classes }
				id={ `comment-${ commentId }` }
				onClick={ isBulkMode ? this.toggleSelected : undefined }
				onKeyDown={ this.keyDownHandler }
				ref={ this.storeCardRef }
			>
				{ refreshCommentData && (
					<QueryComment commentId={ commentId } siteId={ siteId } forceWpcom />
				) }

				{ ( ! isEditMode || isLoading ) && (
					<div className="comment__detail">
						<CommentHeader { ...{ commentId, isBulkMode, isEditMode, isPostView, isSelected } } />

						<CommentContent { ...{ commentId, isBulkMode, isPostView } } />

						{ ! isBulkMode && (
							<CommentActions
								{ ...{ siteId, postId, commentId, commentsListQuery, redirect, updateLastUndo } }
								getCommentOffsetTop={ this.getCommentOffsetTop }
								toggleEditMode={ this.toggleEditMode }
								toggleReply={ this.toggleReply }
							/>
						) }

						{ ! isBulkMode && (
							<CommentReply { ...{ commentId, commentsListQuery, isReplyVisible } } />
						) }
					</div>
				) }

				{ isEditMode && ! isLoading && (
					<CommentEdit { ...{ commentId } } toggleEditMode={ this.toggleEditMode } />
				) }

				{ isPostView && isEnabled( 'comments/management/threaded-view' ) && (
					<CommentRepliesList { ...{ siteId, commentParentId: commentId } } />
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
