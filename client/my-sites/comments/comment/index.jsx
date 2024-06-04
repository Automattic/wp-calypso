import { Card, FoldableCard } from '@automattic/components';
import { isWithinBreakpoint } from '@automattic/viewport';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { debounce, get, isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import QueryComment from 'calypso/components/data/query-comment';
import scrollTo from 'calypso/lib/scroll-to';
import CommentActions from 'calypso/my-sites/comments/comment/comment-actions';
import CommentContent from 'calypso/my-sites/comments/comment/comment-content';
import CommentEdit from 'calypso/my-sites/comments/comment/comment-edit';
import CommentHeader from 'calypso/my-sites/comments/comment/comment-header';
import CommentReply from 'calypso/my-sites/comments/comment/comment-reply';
import { getMinimumComment } from 'calypso/my-sites/comments/comment/utils';
import { getSiteComment } from 'calypso/state/comments/selectors';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

export class Comment extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		commentId: PropTypes.number,
		commentsListQuery: PropTypes.object,
		isAtMaxDepth: PropTypes.bool,
		isBulkMode: PropTypes.bool,
		isPostView: PropTypes.bool,
		isSelected: PropTypes.bool,
		redirect: PropTypes.func,
		refreshCommentData: PropTypes.bool,
		isSingularEditMode: PropTypes.bool,
		toggleSelected: PropTypes.func,
		updateLastUndo: PropTypes.func,
	};

	constructor( props ) {
		super( props );

		this.state = {
			isReplyVisible: false,
			offsetTop: 0,
		};
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		this.debounceScrollToOffset = debounce( this.scrollToOffset, 100 );
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { isBulkMode: wasBulkMode, isPostView: wasPostView } = this.props;
		const { isBulkMode, isPostView } = nextProps;

		const offsetTop =
			wasPostView !== isPostView || `#comment-${ this.props.commentId }` !== window.location.hash
				? 0
				: this.getCommentOffsetTop();

		this.setState( ( { isReplyVisible } ) => ( {
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
		this.props.onToggleEditMode( this.props.commentId );
	};

	toggleReply = () =>
		this.setState( ( { isReplyVisible } ) => ( { isReplyVisible: ! isReplyVisible } ) );

	toggleSelected = () => this.props.toggleSelected( this.props.minimumComment );

	renderComment() {
		const {
			siteId,
			postId,
			commentId,
			commentsListQuery,
			isBulkMode,
			isLoading,
			isPostView,
			isSelected,
			isSingularEditMode,
			redirect,
			refreshCommentData,
			updateLastUndo,
		} = this.props;

		const { isReplyVisible } = this.state;

		const isEditMode = isSingularEditMode && ! isBulkMode;

		return (
			<>
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
			</>
		);
	}

	render() {
		const {
			commentHasNoReply,
			commentId,
			commentIsPending,
			isAtMaxDepth,
			isBulkMode,
			isLoading,
			isSingularEditMode,
			isOwnComment,
			filterUnreplied,
			translate,
		} = this.props;

		const { isReplyVisible } = this.state;

		const isEditMode = isSingularEditMode && ! isBulkMode;

		const classes = clsx( 'comment', {
			'is-at-max-depth': isAtMaxDepth,
			'is-bulk-mode': isBulkMode,
			'is-edit-mode': isEditMode,
			'is-placeholder': isLoading,
			'is-pending': commentIsPending,
			'is-reply-visible': isReplyVisible,
		} );

		if ( filterUnreplied && ! isBulkMode && ( ! commentHasNoReply || isOwnComment ) ) {
			return (
				<FoldableCard
					className={ classes }
					compact
					header={
						isOwnComment
							? translate( 'This is your own comment' )
							: translate( "You've already replied to this comment" )
					}
					id={ `comment-${ commentId }` }
					onClick={ isBulkMode ? this.toggleSelected : undefined }
					onKeyDown={ this.keyDownHandler }
					ref={ this.storeCardRef }
				>
					{ this.renderComment() }
				</FoldableCard>
			);
		}

		return (
			<Card
				className={ classes }
				id={ `comment-${ commentId }` }
				onClick={ isBulkMode ? this.toggleSelected : undefined }
				onKeyDown={ this.keyDownHandler }
				ref={ this.storeCardRef }
			>
				{ this.renderComment() }
			</Card>
		);
	}
}

const mapStateToProps = ( state, { commentId } ) => {
	const siteId = getSelectedSiteId( state );
	const comment = getSiteComment( state, siteId, commentId );
	const commentStatus = get( comment, 'status' );
	const currentUserId = getCurrentUserId( state );
	return {
		siteId,
		postId: get( comment, 'post.ID' ),
		commentIsPending: 'unapproved' === commentStatus,
		commentHasNoReply: ! get( comment, 'i_replied' ),
		isLoading: typeof comment === 'undefined',
		isOwnComment: get( comment, 'author.ID' ) === currentUserId,
		minimumComment: getMinimumComment( comment ),
	};
};

export default connect( mapStateToProps )( localize( Comment ) );
