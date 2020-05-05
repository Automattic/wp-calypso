/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { filter, find, get, isEqual, map, orderBy, slice } from 'lodash';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import Comment from 'my-sites/comments/comment';
import CommentListHeader from 'my-sites/comments/comment-list/comment-list-header';
import CommentNavigation from 'my-sites/comments/comment-navigation';
import EmptyContent from 'components/empty-content';
import Pagination from 'components/pagination';
import QuerySiteCommentsTree from 'components/data/query-site-comments-tree';
import QuerySiteSettings from 'components/data/query-site-settings';
import { getSiteCommentsTree, isCommentsTreeInitialized } from 'state/comments/selectors';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { COMMENTS_PER_PAGE } from '../constants';

const CommentTransition = ( props ) => (
	<CSSTransition { ...props } classNames="comment-list__transition" timeout={ 150 } />
);

export class CommentTree extends Component {
	static propTypes = {
		changePage: PropTypes.func,
		comments: PropTypes.array,
		order: PropTypes.string,
		recordChangePage: PropTypes.func,
		replyComment: PropTypes.func,
		setOrder: PropTypes.func,
		siteId: PropTypes.number,
		status: PropTypes.string,
		translate: PropTypes.func,
	};

	state = {
		isBulkMode: false,
		lastUndo: null,
		selectedComments: [],
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { siteId, status, changePage } = this.props;
		const totalPages = this.getTotalPages();
		if ( ! this.isRequestedPageValid() && totalPages > 1 ) {
			return changePage( totalPages );
		}

		if ( siteId !== nextProps.siteId || status !== nextProps.status ) {
			this.setState( {
				isBulkMode: false,
				lastUndo: null,
				selectedComments: [],
			} );
		}
	}

	shouldComponentUpdate = ( nextProps, nextState ) =>
		! isEqual( this.props, nextProps ) || ! isEqual( this.state, nextState );

	changePage = ( page ) => {
		const { recordChangePage, changePage } = this.props;

		recordChangePage( page, this.getTotalPages() );

		this.setState( { selectedComments: [] } );

		changePage( page );
	};

	getComments = () => orderBy( this.props.comments, null, this.props.order );

	getCommentsPage = ( comments, page ) => {
		const startingIndex = ( page - 1 ) * COMMENTS_PER_PAGE;
		return slice( comments, startingIndex, startingIndex + COMMENTS_PER_PAGE );
	};

	getEmptyMessage = () => {
		const { status, translate } = this.props;

		const defaultLine = translate( 'Your queue is clear.' );

		return get(
			{
				unapproved: [ translate( 'No pending comments.' ), defaultLine ],
				approved: [ translate( 'No approved comments.' ), defaultLine ],
				spam: [ translate( 'No spam comments.' ), defaultLine ],
				trash: [ translate( 'No deleted comments.' ), defaultLine ],
				all: [ translate( 'No comments yet.' ), defaultLine ],
			},
			status,
			[ '', '' ]
		);
	};

	getTotalPages = () => Math.ceil( this.props.comments.length / COMMENTS_PER_PAGE );

	hasCommentJustMovedBackToCurrentStatus = ( commentId ) => this.state.lastUndo === commentId;

	isCommentSelected = ( commentId ) => !! find( this.state.selectedComments, { commentId } );

	isRequestedPageValid = () => this.getTotalPages() >= this.props.page;

	isSelectedAll = () => {
		const { page } = this.props;
		const { selectedComments } = this.state;
		const visibleComments = this.getCommentsPage( this.getComments(), page );
		return selectedComments.length && selectedComments.length === visibleComments.length;
	};

	toggleBulkMode = () => {
		this.setState( ( { isBulkMode } ) => ( { isBulkMode: ! isBulkMode, selectedComments: [] } ) );
	};

	toggleCommentSelected = ( comment ) => {
		if ( this.isCommentSelected( comment.commentId ) ) {
			return this.setState( ( { selectedComments } ) => ( {
				selectedComments: selectedComments.filter(
					( { commentId } ) => comment.commentId !== commentId
				),
			} ) );
		}
		this.setState( ( { selectedComments } ) => ( {
			selectedComments: selectedComments.concat( comment ),
		} ) );
	};

	toggleSelectAll = ( selectedComments ) => this.setState( { selectedComments } );

	updateLastUndo = ( commentId ) => this.setState( { lastUndo: commentId } );

	render() {
		const {
			isLoading,
			isPostView,
			order,
			page,
			postId,
			setOrder,
			siteId,
			siteFragment,
			status,
		} = this.props;
		const { isBulkMode, selectedComments } = this.state;

		const validPage = this.isRequestedPageValid() ? page : 1;

		const comments = this.getComments();
		const commentsCount = comments.length;
		const commentsPage = this.getCommentsPage( comments, validPage );

		const showPlaceholder = ( ! siteId || isLoading ) && ! commentsCount;
		const showEmptyContent = ! commentsCount && ! showPlaceholder;

		const [ emptyMessageTitle, emptyMessageLine ] = this.getEmptyMessage();

		return (
			<div className="comment-tree comment-list">
				<QuerySiteSettings siteId={ siteId } />
				<QuerySiteCommentsTree siteId={ siteId } status={ status } />
				{ isPostView && <CommentListHeader postId={ postId } /> }
				<CommentNavigation
					commentsPage={ commentsPage }
					isBulkMode={ isBulkMode }
					isSelectedAll={ this.isSelectedAll() }
					order={ order }
					postId={ postId }
					selectedComments={ selectedComments }
					setOrder={ setOrder }
					siteId={ siteId }
					siteFragment={ siteFragment }
					status={ status }
					toggleBulkMode={ this.toggleBulkMode }
					toggleSelectAll={ this.toggleSelectAll }
				/>
				{ /* eslint-disable wpcalypso/jsx-classname-namespace */ }
				<TransitionGroup className="comment-list__transition-wrapper">
					{ /* eslint-enable wpcalypso/jsx-classname-namespace */ }
					{ map( commentsPage, ( commentId ) => (
						<CommentTransition key={ `comment-${ siteId }-${ commentId }` }>
							<Comment
								commentId={ commentId }
								isBulkMode={ isBulkMode }
								isPostView={ isPostView }
								isSelected={ this.isCommentSelected( commentId ) }
								refreshCommentData={ ! this.hasCommentJustMovedBackToCurrentStatus( commentId ) }
								toggleSelected={ this.toggleCommentSelected }
								updateLastUndo={ this.updateLastUndo }
							/>
						</CommentTransition>
					) ) }

					{ showPlaceholder && (
						<CommentTransition>
							<Comment commentId={ 0 } key="comment-detail-placeholder" />
						</CommentTransition>
					) }

					{ showEmptyContent && (
						<CommentTransition>
							<EmptyContent
								illustration="/calypso/images/comments/illustration_comments_gray.svg"
								illustrationWidth={ 150 }
								key="comment-list-empty"
								line={ emptyMessageLine }
								title={ emptyMessageTitle }
							/>
						</CommentTransition>
					) }
				</TransitionGroup>
				{ ! showPlaceholder && ! showEmptyContent && (
					<Pagination
						key="comment-list-pagination"
						page={ validPage }
						pageClick={ this.changePage }
						perPage={ COMMENTS_PER_PAGE }
						total={ commentsCount }
					/>
				) }
			</div>
		);
	}
}

const mapStateToProps = ( state, { postId, siteId, status } ) => {
	const isPostView = !! postId;
	const siteCommentsTree =
		isPostView && isEnabled( 'comments/management/threaded-view' )
			? filter( getSiteCommentsTree( state, siteId, status ), { commentParentId: 0 } )
			: getSiteCommentsTree( state, siteId, status );
	const comments = isPostView
		? map( filter( siteCommentsTree, { postId } ), 'commentId' )
		: map( siteCommentsTree, 'commentId' );

	const isLoading = ! isCommentsTreeInitialized( state, siteId, status );
	return {
		comments,
		isLoading,
		isPostView,
		siteId,
	};
};

const mapDispatchToProps = ( dispatch ) => ( {
	recordChangePage: ( page, total ) =>
		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_comment_management_change_page', { page, total } ),
				bumpStat( 'calypso_comment_management', 'change_page' )
			)
		),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentTree ) );
