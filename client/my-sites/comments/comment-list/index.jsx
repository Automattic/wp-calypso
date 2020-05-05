/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, get, isEqual, isUndefined, map } from 'lodash';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

/**
 * Internal dependencies
 */
import Comment from 'my-sites/comments/comment';
import CommentListHeader from 'my-sites/comments/comment-list/comment-list-header';
import CommentNavigation from 'my-sites/comments/comment-navigation';
import EmptyContent from 'components/empty-content';
import Pagination from 'components/pagination';
import QuerySiteCommentCounts from 'components/data/query-site-comment-counts';
import QuerySiteCommentsList from 'components/data/query-site-comments-list';
import QuerySiteSettings from 'components/data/query-site-settings';
import getCommentsPage from 'state/selectors/get-comments-page';
import { getSiteCommentCounts } from 'state/comments/selectors';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { COMMENTS_PER_PAGE } from '../constants';

const CommentTransition = ( props ) => (
	<CSSTransition { ...props } classNames="comment-list__transition" timeout={ 150 } />
);

export class CommentList extends Component {
	static propTypes = {
		changePage: PropTypes.func,
		comments: PropTypes.array,
		commentsCount: PropTypes.number,
		counts: PropTypes.object,
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

	getTotalPages = () => Math.ceil( this.props.commentsCount / COMMENTS_PER_PAGE );

	isCommentSelected = ( commentId ) => !! find( this.state.selectedComments, { commentId } );

	isRequestedPageValid = () => this.getTotalPages() >= this.props.page;

	isSelectedAll = () =>
		this.state.selectedComments.length &&
		this.state.selectedComments.length === this.props.comments.length;

	toggleBulkMode = () => {
		this.setState( ( { isBulkMode } ) => ( { isBulkMode: ! isBulkMode, selectedComments: [] } ) );
	};

	toggleCommentSelected = ( comment ) => {
		if ( ! comment.can_moderate ) {
			return;
		}

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

	render() {
		const {
			comments,
			commentsCount,
			counts,
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

		const commentsListQuery = {
			listType: 'site',
			number: COMMENTS_PER_PAGE,
			order: order.toUpperCase(),
			page: validPage,
			postId,
			siteId,
			status,
			type: 'any',
		};

		const showPlaceholder = ( ! siteId || isLoading ) && ! comments.length;
		const showEmptyContent = ! isLoading && ! commentsCount && ! showPlaceholder;

		const [ emptyMessageTitle, emptyMessageLine ] = this.getEmptyMessage();

		return (
			<div className="comment-list">
				<QuerySiteSettings siteId={ siteId } />
				<QuerySiteCommentCounts { ...{ siteId, postId } } />
				<QuerySiteCommentsList { ...commentsListQuery } />

				{ isPostView && <CommentListHeader postId={ postId } /> }

				<CommentNavigation
					commentsListQuery={ commentsListQuery }
					commentsPage={ comments }
					counts={ counts }
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

				<TransitionGroup className="comment-list__transition-wrapper">
					{ map( comments, ( commentId ) => (
						<CommentTransition key={ `comment-${ siteId }-${ commentId }` }>
							<Comment
								commentId={ commentId }
								commentsListQuery={ commentsListQuery }
								isBulkMode={ isBulkMode }
								isPostView={ isPostView }
								isSelected={ this.isCommentSelected( commentId ) }
								toggleSelected={ this.toggleCommentSelected }
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

				{ ! isLoading && ! showPlaceholder && ! showEmptyContent && (
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

const mapStateToProps = ( state, { order, page, postId, siteId, status } ) => {
	const comments = getCommentsPage( state, siteId, { order, page, postId, status } );
	const counts = getSiteCommentCounts( state, siteId, postId );
	const commentsCount = get( counts, 'unapproved' === status ? 'pending' : status );
	const isLoading = isUndefined( comments );
	const isPostView = !! postId;

	return {
		comments: comments || [],
		commentsCount,
		counts,
		isLoading,
		isPostView,
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

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentList ) );
