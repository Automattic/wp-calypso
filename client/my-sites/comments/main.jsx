/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	changeCommentStatus,
	deleteComment,
	editComment,
	likeComment,
	replyComment,
	unlikeComment,
} from 'state/comments/actions';
import getSiteId from 'state/selectors/get-site-id';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import Pagination from 'components/pagination';
import DocumentHead from 'components/data/document-head';
import CommentsList from './comments-list';
import { removeNotice, successNotice } from 'state/notices/actions';
import CommentsNavigation from './comments-navigation';
import QuerySiteCommentsList from 'components/data/query-site-comments-list';
import QuerySiteCommentsTree from 'components/data/query-site-comments-tree';
import QuerySiteSettings from 'components/data/query-site-settings';
import { each, get, map, noop, orderBy, slice, size, uniq } from 'lodash';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getSiteCommentsTree, canCurrentUser, isCommentsTreeInitialized } from 'state/selectors';
import { preventWidows } from 'lib/formatting';
import EmptyContent from 'components/empty-content';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import { COMMENTS_PER_PAGE, NEWEST_FIRST } from './constants';

export class Comments extends Component {
	static propTypes = {
		comments: PropTypes.array,
		isLoading: PropTypes.bool,
		page: PropTypes.number,
		recordChangePage: PropTypes.func,
		showPermissionError: PropTypes.bool,
		siteId: PropTypes.number,
		siteFragment: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		status: PropTypes.string,
		translate: PropTypes.func,
	};

	static defaultProps = {
		page: 1,
		status: 'all',
	};

	state = {
		isBulkEdit: false,
		// TODO: replace with [] when adding back Bulk Actions
		lastUndo: null,
		persistedComments: [],
		selectedComments: [],
		sortOrder: NEWEST_FIRST,
	};

	componentWillReceiveProps( nextProps ) {
		const { siteId, status, changePage } = this.props;
		const totalPages = this.getTotalPages();
		if ( ! this.isRequestedPageValid() && totalPages > 1 ) {
			return changePage( totalPages );
		}

		if ( siteId !== nextProps.siteId || status !== nextProps.status ) {
			this.setState( {
				isBulkEdit: false,
				lastUndo: null,
				persistedComments: [],
				selectedComments: [],
			} );
		}
	}

	changePage = page => {
		const { recordChangePage, changePage } = this.props;

		recordChangePage( page, this.getTotalPages() );

		this.setState( { selectedComments: [] } );

		changePage( page );
	};

	deleteCommentPermanently = ( commentId, postId ) => {
		this.props.removeNotice( `comment-notice-${ commentId }` );

		this.props.deleteComment( commentId, postId );
	};

	editComment = ( commentId, postId, commentData, undoCommentData, showNotice = true ) => {
		this.props.editComment( commentId, postId, commentData );
		if ( showNotice ) {
			this.showEditNotice( commentId, postId, undoCommentData );
		}
	};

	getComments = () => {
		const comments = uniq( [ ...this.state.persistedComments, ...this.props.comments ] );

		return orderBy( comments, null, this.state.sortOrder );
	};

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

	getTotalPages = () =>
		Math.ceil(
			( this.props.comments.length + this.state.persistedComments.length ) / COMMENTS_PER_PAGE
		);

	hasCommentJustMovedBackToCurrentStatus = commentId => this.state.lastUndo === commentId;

	isCommentPersisted = commentId => -1 !== this.state.persistedComments.indexOf( commentId );

	isCommentSelected = commentId => !! find( this.state.selectedComments, { commentId } );

	isRequestedPageValid = () => this.getTotalPages() >= this.props.page;

	isSelectedAll = () => {
		const { page } = this.props;
		const { selectedComments } = this.state;
		const visibleComments = this.getCommentsPage( this.getComments(), page );
		return selectedComments.length && selectedComments.length === visibleComments.length;
	};

	removeFromPersistedComments = commentId =>
		this.setState( ( { persistedComments } ) => ( {
			persistedComments: persistedComments.filter( c => c !== commentId ),
		} ) );

	replyComment = ( commentText, parentComment ) => {
		const { translate } = this.props;
		const { commentId: parentCommentId, postId, status } = parentComment;
		const alsoApprove = 'approved' !== status;

		this.props.removeNotice( `comment-notice-${ parentCommentId }` );

		const noticeMessage = alsoApprove
			? translate( 'Comment approved and reply submitted.' )
			: translate( 'Reply submitted.' );

		const noticeOptions = {
			duration: 5000,
			id: `comment-notice-${ parentCommentId }`,
			isPersistent: true,
		};

		if ( alsoApprove ) {
			this.setCommentStatus( parentComment, 'approved', { doPersist: true, showNotice: false } );
		}

		this.props.successNotice( noticeMessage, noticeOptions );
		this.props.replyComment( commentText, postId, parentCommentId, { alsoApprove } );
	};

	setBulkStatus = status => () => {
		const { status: listStatus } = this.props;
		this.props.removeNotice( 'comment-notice-bulk' );

		// Only persist comments if they toggle between approved and unapproved
		const doPersist =
			( 'approved' === listStatus && 'unapproved' === status ) ||
			( 'unapproved' === listStatus && 'approved' === status );

		each( this.state.selectedComments, comment => {
			if ( 'delete' === status ) {
				this.props.deleteComment( comment.commentId, comment.postId, { showSuccessNotice: false } );
				return;
			}

			this.setCommentStatus( comment, status, {
				isUndo: false,
				doPersist,
				showNotice: false,
			} );
		} );

		this.showBulkNotice( status );

		this.setState( { isBulkEdit: false, selectedComments: [] } );
	};

	setCommentStatus = (
		comment,
		status,
		options = { isUndo: false, doPersist: false, showNotice: true }
	) => {
		const { commentId, postId, isLiked, status: previousStatus } = comment;
		const { isUndo, doPersist, showNotice } = options;
		const alsoUnlikeComment = isLiked && 'approved' !== status;

		if ( isUndo ) {
			this.setState( { lastUndo: commentId } );
		} else {
			this.setState( { lastUndo: null } );
		}

		if ( doPersist ) {
			this.updatePersistedComments( commentId, isUndo );
		} else {
			this.removeFromPersistedComments( commentId );
		}

		this.props.removeNotice( `comment-notice-${ commentId }` );

		if ( showNotice ) {
			this.showNotice( comment, status, { doPersist } );
		}

		this.props.changeCommentStatus( commentId, postId, status, {
			alsoUnlike: alsoUnlikeComment,
			isUndo,
			previousStatus,
		} );

		// If the comment is not approved anymore, also remove the like
		if ( alsoUnlikeComment ) {
			this.props.unlikeComment( commentId, postId );
		}
	};

	setSortOrder = order => () => {
		this.setState( {
			sortOrder: order,
			page: 1,
		} );
	};

	showEditNotice = ( commentId, postId, undoCommentData ) => {
		const { translate } = this.props;

		const message = translate( 'Your comment has been updated.' );

		const noticeOptions = {
			button: translate( 'Undo' ),
			duration: 5000,
			id: `comment-notice-${ commentId }`,
			isPersistent: true,
			onClick: () => {
				this.editComment( commentId, postId, undoCommentData, false );
				this.props.removeNotice( `comment-notice-${ commentId }` );
			},
		};

		this.props.successNotice( message, noticeOptions );
	};

	showBulkNotice = newStatus => {
		const { translate } = this.props;

		const message = get(
			{
				approved: translate( 'All selected comments approved.' ),
				unapproved: translate( 'All selected comments unapproved.' ),
				spam: translate( 'All selected comments marked as spam.' ),
				trash: translate( 'All selected comments moved to trash.' ),
				delete: translate( 'All selected comments deleted permanently.' ),
			},
			newStatus
		);

		if ( ! message ) {
			return;
		}

		const noticeOptions = {
			duration: 5000,
			id: 'comment-notice-bulk',
			isPersistent: true,
		};

		this.props.successNotice( message, noticeOptions );
	};

	showNotice = ( comment, newStatus, options = { doPersist: false } ) => {
		const { translate } = this.props;
		const { commentId, isLiked: previousIsLiked, postId, status: previousStatus } = comment;

		const message = get(
			{
				approved: translate( 'Comment approved.' ),
				unapproved: translate( 'Comment unapproved.' ),
				spam: translate( 'Comment marked as spam.' ),
				trash: translate( 'Comment moved to trash.' ),
			},
			newStatus
		);

		if ( ! message ) {
			return;
		}

		const noticeOptions = {
			button: translate( 'Undo' ),
			duration: 5000,
			id: `comment-notice-${ commentId }`,
			isPersistent: true,
			onClick: () => {
				const updatedComment = {
					...comment,
					status: newStatus,
				};
				this.setCommentStatus( updatedComment, previousStatus, {
					isUndo: true,
					doPersist: options.doPersist,
					showNotice: false,
				} );
				if ( previousIsLiked ) {
					this.props.likeComment( commentId, postId );
				} else if ( ! previousIsLiked && 'approved' !== previousStatus ) {
					this.props.unlikeComment( commentId, postId );
				}
			},
		};

		this.props.successNotice( message, noticeOptions );
	};

	toggleBulkEdit = () => {
		this.setState( ( { isBulkEdit } ) => ( { isBulkEdit: ! isBulkEdit } ) );
	};

	toggleCommentLike = comment => {
		const { commentId, isLiked, postId, status } = comment;

		if ( isLiked ) {
			this.props.unlikeComment( commentId, postId );
			return;
		}

		const alsoApprove = 'unapproved' === status;

		this.props.likeComment( commentId, postId, { alsoApprove } );

		if ( alsoApprove ) {
			this.props.removeNotice( `comment-notice-${ commentId }` );
			this.setCommentStatus( comment, 'approved', { doPersist: true, showNotice: true } );
			this.updatePersistedComments( commentId );
		}
	};

	toggleCommentSelected = comment => {
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

	toggleSelectAll = selectedComments => this.setState( { selectedComments } );

	updatePersistedComments = ( commentId, isUndo ) => {
		if ( isUndo ) {
			this.removeFromPersistedComments( commentId );
		} else if ( ! this.isCommentPersisted( commentId ) ) {
			this.setState( ( { persistedComments } ) => ( {
				persistedComments: persistedComments.concat( commentId ),
			} ) );
		}
	};

	render() {
		const {
			isLoading,
			isJetpack,
			showPermissionError,
			page,
			siteId,
			siteFragment,
			status,
			translate,
		} = this.props;
		const { isBulkEdit, selectedComments } = this.state;

		const validPage = this.isRequestedPageValid() ? page : 1;
		const comments = this.getComments();
		const commentsCount = comments.length;
		const commentsPage = this.getCommentsPage( comments, validPage );
		const showPlaceholder = ( ! siteId || isLoading ) && ! commentsCount;
		const showEmptyContent = ! commentsCount && ! showPlaceholder;
		const [ emptyMessageTitle, emptyMessageLine ] = this.getEmptyMessage();

		return (
			<Main className="comments" wideLayout>
				<PageViewTracker path="/comments/:status/:site" title="Comments" />
				<DocumentHead title={ translate( 'Comments' ) } />
				<SidebarNavigation />
				<QuerySiteSettings siteId={ siteId } />

				{ isJetpack && (
					<QuerySiteCommentsList
						number={ 100 }
						offset={ ( validPage - 1 ) * COMMENTS_PER_PAGE }
						siteId={ siteId }
						status={ status }
					/>
				) }

				{ ! isJetpack && <QuerySiteCommentsTree siteId={ siteId } status={ status } /> }

				<CommentsNavigation
					commentsPage={ commentsPage }
					isBulkEdit={ isBulkEdit }
					isSelectedAll={ this.isSelectedAll() }
					selectedCount={ size( selectedComments ) }
					setBulkStatus={ this.setBulkStatus }
					setSortOrder={ this.setSortOrder }
					sortOrder={ this.state.sortOrder }
					siteId={ siteId }
					siteFragment={ siteFragment }
					status={ status }
					toggleBulkEdit={ this.toggleBulkEdit }
					toggleSelectAll={ this.toggleSelectAll }
				/>

				{ showPermissionError && (
					<EmptyContent
						title={ preventWidows(
							translate( "Oops! You don't have permission to manage comments." )
						) }
						line={ preventWidows(
							translate( "If you think you should, contact this site's administrator." )
						) }
						illustration="/calypso/images/illustrations/illustration-500.svg"
					/>
				) }
				{ ! showPermissionError && (
					<CommentsList
						comments={ comments }
						siteId={ siteId }
						status={ status }
						order={ 'desc' }
						showEmptyContent={ showEmptyContent }
						showPlaceholder={ showPlaceholder }
						emptyMessageLine={ emptyMessageLine }
						emptyMessageTitle={ emptyMessageTitle }
						isJetpack={ isJetpack }
						isBulkEdit={ isBulkEdit }
						isCommentSelected={ this.isCommentSelected }
						hasCommentJustMovedBackToCurrentStatus={ this.hasCommentJustMovedBackToCurrentStatus }
						setCommentStatus={ this.setCommentStatus }
						toggleCommentSelected={ this.toggleCommentSelected }
						toggleCommentLike={ this.toggleCommentLike }
					/>
				) }

				{ ! showPlaceholder &&
				! showEmptyContent && (
					<Pagination
						key="comment-list-pagination"
						page={ validPage }
						pageClick={ this.changePage }
						perPage={ COMMENTS_PER_PAGE }
						total={ commentsCount }
					/>
				) }
			</Main>
		);
	}
}

const mapStateToProps = ( state, { siteFragment, status } ) => {
	const siteId = getSiteId( state, siteFragment );
	const comments = map( getSiteCommentsTree( state, siteId, status ), 'commentId' );
	const isLoading = ! isCommentsTreeInitialized( state, siteId, status );
	const canModerateComments = canCurrentUser( state, siteId, 'moderate_comments' );
	return {
		comments,
		isLoading,
		siteId,
		showPermissionError: canModerateComments === false,
	};
};

const mapDispatchToProps = ( dispatch, { siteId } ) => ( {
	changeCommentStatus: (
		commentId,
		postId,
		status,
		analytics = { alsoUnlike: false, isUndo: false }
	) =>
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_comment_management_change_status', {
						also_unlike: analytics.alsoUnlike,
						is_undo: analytics.isUndo,
						previous_status: analytics.previousStatus,
						status,
					} ),
					bumpStat( 'calypso_comment_management', 'comment_status_changed_to_' + status )
				),
				changeCommentStatus( siteId, postId, commentId, status )
			)
		),

	successNotice: ( text, options ) => dispatch( successNotice( text, options ) ),

	deleteComment: ( commentId, postId, options = { showSuccessNotice: true } ) =>
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_comment_management_delete' ),
					bumpStat( 'calypso_comment_management', 'comment_deleted' )
				),
				deleteComment( siteId, postId, commentId, options )
			)
		),

	editComment: ( commentId, postId, comment ) =>
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_comment_management_edit' ),
					bumpStat( 'calypso_comment_management', 'comment_updated' )
				),
				editComment( siteId, postId, commentId, comment )
			)
		),

	likeComment: ( commentId, postId, analytics = { alsoApprove: false } ) =>
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_comment_management_like', {
						also_approve: analytics.alsoApprove,
					} ),
					bumpStat( 'calypso_comment_management', 'comment_liked' )
				),
				likeComment( siteId, postId, commentId )
			)
		),

	recordChangePage: ( page, total ) =>
		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_comment_management_change_page', { page, total } ),
				bumpStat( 'calypso_comment_management', 'change_page' )
			)
		),

	removeNotice: noticeId => dispatch( removeNotice( noticeId ) ),

	replyComment: ( commentText, postId, parentCommentId, analytics = { alsoApprove: false } ) =>
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_comment_management_reply', {
						also_approve: analytics.alsoApprove,
					} ),
					bumpStat( 'calypso_comment_management', 'comment_reply' )
				),
				replyComment( commentText, siteId, postId, parentCommentId )
			)
		),

	setBulkStatus: noop,
	undoBulkStatus: noop,

	unlikeComment: ( commentId, postId ) =>
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_comment_management_unlike' ),
					bumpStat( 'calypso_comment_management', 'comment_unliked' )
				),
				unlikeComment( siteId, postId, commentId )
			)
		),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( Comments ) );
