import { localize } from 'i18n-calypso';
import { find, get, isEqual, map } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import QuerySiteCommentCounts from 'calypso/components/data/query-site-comment-counts';
import QuerySiteCommentsList from 'calypso/components/data/query-site-comments-list';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import EmptyContent from 'calypso/components/empty-content';
import Pagination from 'calypso/components/pagination';
import Comment from 'calypso/my-sites/comments/comment';
import CommentListHeader from 'calypso/my-sites/comments/comment-list/comment-list-header';
import CommentNavigation from 'calypso/my-sites/comments/comment-navigation';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSiteCommentCounts } from 'calypso/state/comments/selectors';
import getCommentsPage from 'calypso/state/selectors/get-comments-page';
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
		filterUnreplied: PropTypes.bool,
		order: PropTypes.string,
		recordChangePage: PropTypes.func,
		replyComment: PropTypes.func,
		setFilterUnreplied: PropTypes.func,
		setOrder: PropTypes.func,
		siteId: PropTypes.number,
		status: PropTypes.string,
		translate: PropTypes.func,
	};

	state = {
		isBulkMode: false,
		selectedComments: [],
		editingCommentId: null,
	};

	componentDidUpdate() {
		const { changePage } = this.props;
		const totalPages = this.getTotalPages();

		if ( ! this.isRequestedPageValid() && totalPages > 1 ) {
			return changePage( totalPages );
		}
	}

	toggleEditMode = ( commentId ) => {
		this.setState( ( { editingCommentId } ) => {
			if ( commentId === editingCommentId ) {
				return { editingCommentId: null };
			}
			return { editingCommentId: commentId };
		} );
	};

	shouldComponentUpdate = ( nextProps, nextState ) =>
		! isEqual( this.props, nextProps ) || ! isEqual( this.state, nextState );

	handlePageClick = ( page ) => {
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
			filterUnreplied,
			isLoading,
			isPostView,
			order,
			page,
			postId,
			setFilterUnreplied,
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
					filterUnreplied={ filterUnreplied }
					isBulkMode={ isBulkMode }
					isPostView={ isPostView }
					isSelectedAll={ this.isSelectedAll() }
					order={ order }
					postId={ postId }
					selectedComments={ selectedComments }
					setFilterUnreplied={ setFilterUnreplied }
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
								filterUnreplied={ filterUnreplied }
								isBulkMode={ isBulkMode }
								isPostView={ isPostView }
								isSelected={ this.isCommentSelected( commentId ) }
								toggleSelected={ this.toggleCommentSelected }
								onToggleEditMode={ this.toggleEditMode }
								isSingularEditMode={ this.state.editingCommentId === commentId }
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
						pageClick={ this.handlePageClick }
						perPage={ COMMENTS_PER_PAGE }
						total={ commentsCount }
					/>
				) }
			</div>
		);
	}
}

const mapStateToProps = ( state, { filterUnreplied, order, page, postId, siteId, status } ) => {
	const comments = getCommentsPage( state, siteId, {
		filterUnreplied,
		order,
		page,
		postId,
		status,
	} );
	const counts = getSiteCommentCounts( state, siteId, postId );
	const commentsCount = get( counts, 'unapproved' === status ? 'pending' : status );
	const isLoading = typeof comments === 'undefined';
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
