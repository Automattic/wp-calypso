/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, get, keyBy, keys, map, noop, omit, size, slice, uniq } from 'lodash';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

/**
 * Internal dependencies
 */
import {
	changeCommentStatus,
	deleteComment,
	likeComment,
	replyComment,
	unlikeComment,
} from 'state/comments/actions';
import { removeNotice, successNotice } from 'state/notices/actions';
import { getNotices } from 'state/notices/selectors';
import CommentDetail from 'blocks/comment-detail';
import CommentDetailPlaceholder from 'blocks/comment-detail/comment-detail-placeholder';
import CommentNavigation from '../comment-navigation';
import EmptyContent from 'components/empty-content';
import Pagination from 'components/pagination';
import QuerySiteCommentsList from 'components/data/query-site-comments-list';
import QuerySiteCommentsTree from 'components/data/query-site-comments-tree';
import { getSiteCommentsTree, isCommentsTreeInitialized } from 'state/selectors';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import { isJetpackSite } from 'state/sites/selectors';

const COMMENTS_PER_PAGE = 20;

export class CommentList extends Component {
	static propTypes = {
		changeCommentStatus: PropTypes.func,
		comments: PropTypes.array,
		deleteComment: PropTypes.func,
		likeComment: PropTypes.func,
		recordChangePage: PropTypes.func,
		replyComment: PropTypes.func,
		setBulkStatus: PropTypes.func,
		siteId: PropTypes.number,
		status: PropTypes.string,
		translate: PropTypes.func,
		undoBulkStatus: PropTypes.func,
		unlikeComment: PropTypes.func,
	};

	state = {
		isBulkEdit: false,
		// TODO: replace with [] when adding back Bulk Actions
		lastUndo: null,
		page: 1,
		persistedComments: [],
		// TODO: replace {} with [] after persistedComments is merged
		selectedComments: {},
	};
	componentWillReceiveProps( nextProps ) {
		if ( this.props.status !== nextProps.status ) {
			this.setState( {
				lastUndo: null,
				page: 1,
				persistedComments: [],
				selectedComments: {},
			} );
		}
	}

	changePage = page => {
		const total = Math.ceil( ( this.props.comments.length + this.state.persistedComments.length ) / COMMENTS_PER_PAGE );
		this.props.recordChangePage( page, total );

		this.setState( {
			page,
			selectedComments: {},
		} );
	};

	deleteCommentPermanently = ( commentId, postId ) => {
		this.props.removeNotice( `comment-notice-${ commentId }` );

		this.props.deleteComment( commentId, postId );
	}

	// TODO: remove after persistedComments is merged
	getComment = commentId => find( this.getComments(), [ 'ID', commentId ] );

	getComments = () => uniq( [ ...this.state.persistedComments, ...this.props.comments ] ).sort( ( a, b ) => b - a );

	getCommentsPage = ( comments, page ) => {
		const startingIndex = ( page - 1 ) * COMMENTS_PER_PAGE;
		return slice( comments, startingIndex, startingIndex + COMMENTS_PER_PAGE );
	};

	getEmptyMessage = () => {
		const { status, translate } = this.props;

		const defaultLine = translate( 'Your queue is clear.' );

		return get( {
			unapproved: [ translate( 'No pending comments.' ), defaultLine ],
			approved: [ translate( 'No approved comments.' ), defaultLine ],
			spam: [ translate( 'No spam comments.' ), defaultLine ],
			trash: [ translate( 'No deleted comments.' ), defaultLine ],
			all: [ translate( 'No comments yet.' ), defaultLine ],
		}, status, [ '', '' ] );
	}

	hasCommentJustMovedBackToCurrentStatus = commentId => this.state.lastUndo === commentId;

	isCommentPersisted = commentId => -1 !== this.state.persistedComments.indexOf( commentId );

	// TODO: replace with array logic after persistedComments is merged
	isCommentSelected = commentId => !! this.state.selectedComments[ commentId ];

	isSelectedAll = () => this.getComments().length === size( this.state.selectedComments );

	removeFromPersistedComments = commentId => this.setState(
		( { persistedComments } ) => ( {
			persistedComments: persistedComments.filter( c => c !== commentId ),
		} )
	);

	replyComment = ( commentText, parentComment ) => {
		const { translate } = this.props;
		const {
			commentId: parentCommentId,
			postId,
			status,
		} = parentComment;
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
	}

	// TODO: rewrite after persistedComments is merged
	setBulkStatus = status => () => {
		this.props.removeNotice( 'comment-notice-bulk' );

		this.props.setBulkStatus( keys( this.state.selectedComments ), status );

		this.showBulkNotice( status, this.state.selectedComments );

		this.setState( {
			isBulkEdit: false,
			selectedComments: {},
		} );
	};

	setCommentStatus = ( comment, status, options = { isUndo: false, doPersist: false, showNotice: true } ) => {
		const {
			commentId,
			postId,
			isLiked,
			status: previousStatus,
		} = comment;
		const { isUndo, doPersist, showNotice } = options;
		const alsoUnlikeComment = isLiked && ( 'approved' !== status );

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
	}

	// TODO: rewrite after persistedComments is merged
	showBulkNotice = ( newStatus, selectedComments ) => {
		const { translate } = this.props;

		const message = get( {
			approved: translate( 'All selected comments approved.' ),
			unapproved: translate( 'All selected comments unapproved.' ),
			spam: translate( 'All selected comments marked as spam.' ),
			trash: translate( 'All selected comments moved to trash.' ),
			'delete': translate( 'All selected comments deleted permanently.' ),
		}, newStatus );

		if ( ! message ) {
			return;
		}

		const options = Object.assign(
			{
				duration: 5000,
				id: 'comment-notice-bulk',
				isPersistent: true,
			},
			'delete' !== newStatus && {
				button: translate( 'Undo' ),
				onClick: () => this.undoBulkStatus( selectedComments ),
			}
		);

		this.props.successNotice( message, options );
	}

	showNotice = ( comment, newStatus, options = { doPersist: false } ) => {
		const { translate } = this.props;
		const {
			commentId,
			isLiked: previousIsLiked,
			postId,
			status: previousStatus,
		} = comment;

		const message = get( {
			approved: translate( 'Comment approved.' ),
			unapproved: translate( 'Comment unapproved.' ),
			spam: translate( 'Comment marked as spam.' ),
			trash: translate( 'Comment moved to trash.' ),
		}, newStatus );

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
	}

	toggleBulkEdit = () => this.setState( { isBulkEdit: ! this.state.isBulkEdit } );

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
	}

	// TODO: rewrite after persistedComments is merged
	toggleCommentSelected = commentId => {
		// TODO: Replace with Redux getComment()
		const { i_like, status } = this.getComment( commentId );
		const { selectedComments } = this.state;

		this.setState( {
			selectedComments: this.isCommentSelected( commentId )
				? omit( selectedComments, commentId )
				: {
					...selectedComments,
					[ commentId ]: { i_like, status },
				},
		} );
	}

	// TODO: rewrite after persistedComments is merged
	toggleSelectAll = () => {
		this.setState( {
			selectedComments: this.isSelectedAll()
				? {}
				: keyBy( map( this.getComments(), ( { ID, i_like, status } ) => ( { ID, i_like, status } ) ), 'ID' ),
		} );
	}

	// TODO: rewrite after persistedComments is merged
	undoBulkStatus = selectedComments => {
		this.props.removeNotice( 'comment-notice-bulk' );
		this.props.undoBulkStatus( selectedComments );
	}

	updatePersistedComments = ( commentId, isUndo ) => {
		if ( isUndo ) {
			this.removeFromPersistedComments( commentId );
		} else if ( ! this.isCommentPersisted( commentId ) ) {
			this.setState(
				( { persistedComments } ) => ( {
					persistedComments: persistedComments.concat( commentId ),
				} )
			);
		}
	}

	render() {
		const {
			isJetpack,
			isLoading,
			siteId,
			siteFragment,
			status,
		} = this.props;
		const {
			isBulkEdit,
			page,
			selectedComments,
		} = this.state;

		const comments = this.getComments();
		const commentsCount = comments.length;
		const commentsPage = this.getCommentsPage( comments, page );

		const showPlaceholder = ( ! siteId || isLoading ) && ! commentsCount;
		const showEmptyContent = ! commentsCount && ! showPlaceholder;

		const [ emptyMessageTitle, emptyMessageLine ] = this.getEmptyMessage();

		return (
			<div className="comment-list">
				{ isJetpack &&
					<QuerySiteCommentsList
						number={ 100 }
						offset={ ( page - 1 ) * COMMENTS_PER_PAGE }
						siteId={ siteId }
						status={ status }
					/>
				}
				{ ! isJetpack &&
					<QuerySiteCommentsTree siteId={ siteId } status={ status } />
				}

				<CommentNavigation
					isBulkEdit={ isBulkEdit }
					isSelectedAll={ this.isSelectedAll() }
					selectedCount={ size( selectedComments ) }
					setBulkStatus={ this.setBulkStatus }
					siteFragment={ siteFragment }
					status={ status }
					toggleBulkEdit={ this.toggleBulkEdit }
					toggleSelectAll={ this.toggleSelectAll }
				/>
				<ReactCSSTransitionGroup
					className="comment-list__transition-wrapper"
					transitionEnterTimeout={ 150 }
					transitionLeaveTimeout={ 150 }
					transitionName="comment-list__transition"
				>
					{ map( commentsPage, commentId =>
						<CommentDetail
							commentId={ commentId }
							deleteCommentPermanently={ this.deleteCommentPermanently }
							isBulkEdit={ isBulkEdit }
							commentIsSelected={ this.isCommentSelected( commentId ) }
							key={ `comment-${ siteId }-${ commentId }` }
							refreshCommentData={ ! isJetpack && ! this.hasCommentJustMovedBackToCurrentStatus( commentId ) }
							replyComment={ this.replyComment }
							setCommentStatus={ this.setCommentStatus }
							siteId={ siteId }
							toggleCommentLike={ this.toggleCommentLike }
							toggleCommentSelected={ this.toggleCommentSelected }
						/>
					) }

					{ showPlaceholder && <CommentDetailPlaceholder key="comment-detail-placeholder" /> }

					{ showEmptyContent && <EmptyContent
						illustration="/calypso/images/comments/illustration_comments_gray.svg"
						illustrationWidth={ 150 }
						key="comment-list-empty"
						line={ emptyMessageLine }
						title={ emptyMessageTitle }
					/> }
				</ReactCSSTransitionGroup>

				{ ! showPlaceholder && ! showEmptyContent &&
					<Pagination
						key="comment-list-pagination"
						page={ page }
						pageClick={ this.changePage }
						perPage={ COMMENTS_PER_PAGE }
						total={ commentsCount }
					/>
				}
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId, status } ) => {
	const comments = map( getSiteCommentsTree( state, siteId, status ), 'commentId' );
	const isLoading = ! isCommentsTreeInitialized( state, siteId, status );
	return {
		comments,
		isJetpack: isJetpackSite( state, siteId ),
		isLoading,
		notices: getNotices( state ),
		siteId,
	};
};

const mapDispatchToProps = ( dispatch, { siteId } ) => ( {
	changeCommentStatus: ( commentId, postId, status, analytics = { alsoUnlike: false, isUndo: false } ) => dispatch( withAnalytics(
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
	) ),

	successNotice: ( text, options ) => dispatch( successNotice( text, options ) ),

	deleteComment: ( commentId, postId ) => dispatch( withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_comment_management_delete' ),
			bumpStat( 'calypso_comment_management', 'comment_deleted' )
		),
		deleteComment( siteId, postId, commentId )
	) ),

	likeComment: ( commentId, postId, analytics = { alsoApprove: false } ) => dispatch( withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_comment_management_like', {
				also_approve: analytics.alsoApprove,
			} ),
			bumpStat( 'calypso_comment_management', 'comment_liked' )
		),
		likeComment( siteId, postId, commentId )
	) ),

	recordChangePage: ( page, total ) => dispatch( composeAnalytics(
		recordTracksEvent( 'calypso_comment_management_change_page', { page, total } ),
		bumpStat( 'calypso_comment_management', 'change_page' )
	) ),

	removeNotice: noticeId => dispatch( removeNotice( noticeId ) ),

	replyComment: ( commentText, postId, parentCommentId, analytics = { alsoApprove: false } ) => dispatch( withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_comment_management_reply', {
				also_approve: analytics.alsoApprove,
			} ),
			bumpStat( 'calypso_comment_management', 'comment_reply' )
		),
		replyComment( commentText, siteId, postId, parentCommentId )
	) ),

	setBulkStatus: noop,
	undoBulkStatus: noop,

	unlikeComment: ( commentId, postId ) => dispatch( withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_comment_management_unlike' ),
			bumpStat( 'calypso_comment_management', 'comment_unliked' )
		),
		unlikeComment( siteId, postId, commentId )
	) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentList ) );
