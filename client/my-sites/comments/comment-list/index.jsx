/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, get, keyBy, keys, map, noop, omit, orderBy, reject, size, uniqBy } from 'lodash';
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
import { createNotice, removeNotice } from 'state/notices/actions';
import { getNotices } from 'state/notices/selectors';
import getSiteComments from 'state/selectors/get-site-comments';
import CommentDetail from 'blocks/comment-detail';
import CommentDetailPlaceholder from 'blocks/comment-detail/comment-detail-placeholder';
import CommentNavigation from '../comment-navigation';
import EmptyContent from 'components/empty-content';
import Pagination from 'components/pagination';
import QuerySiteComments from 'components/data/query-site-comments';
import { hasSiteComments } from 'state/selectors';

const COMMENTS_PER_PAGE = 2;

export class CommentList extends Component {
	static propTypes = {
		changeCommentStatus: PropTypes.func,
		comments: PropTypes.array,
		commentsCount: PropTypes.number,
		commentsPage: PropTypes.number,
		deleteComment: PropTypes.func,
		likeComment: PropTypes.func,
		replyComment: PropTypes.func,
		setBulkStatus: PropTypes.func,
		setCommentsPage: PropTypes.func,
		siteId: PropTypes.number,
		status: PropTypes.string,
		translate: PropTypes.func,
		undoBulkStatus: PropTypes.func,
		unlikeComment: PropTypes.func,
	};

	static defaultProps = {
		commentsCount: 0,
		commentsPage: 1,
	};

	state = {
		isBulkEdit: false,
		persistedComments: [],
		selectedComments: {},
	};

	componentWillReceiveProps( nextProps ) {
		if ( this.props.status !== nextProps.status ) {
			this.setState( {
				persistedComments: [],
				selectedComments: {},
			} );
		}
	}

	changePage = page => {
		this.setState( { selectedComments: {} } );
		this.props.setCommentsPage( page );
	}

	deleteCommentPermanently = ( commentId, postId ) => {
		this.props.removeNotice( `comment-notice-${ commentId }` );

		this.props.deleteComment( commentId, postId );
	}

	getComment = commentId => find( this.getComments(), [ 'ID', commentId ] );

	getComments = () => orderBy(
		uniqBy( [ ...this.state.persistedComments, ...this.props.comments ], 'ID' ),
		'date',
		'desc'
	);

	getEmptyMessage = () => {
		const { status, translate } = this.props;

		const defaultLine = translate( 'Your queue is clear.' );

		return get( {
			unapproved: [ translate( 'No new comments yet.' ), defaultLine ],
			approved: [ translate( 'No approved comments.' ), defaultLine ],
			spam: [ translate( 'No spam comments.' ), defaultLine ],
			trash: [ translate( 'No deleted comments.' ), defaultLine ],
			all: [ translate( 'No comments yet.' ), defaultLine ],
		}, status, [ '', '' ] );
	}

	isCommentSelected = commentId => !! this.state.selectedComments[ commentId ];

	isSelectedAll = () => this.getComments().length === size( this.state.selectedComments );

	removeFromPersistedComments = commentId => this.setState( ( { persistedComments } ) => ( {
		persistedComments: reject( persistedComments, { ID: commentId } ),
	} ) );

	replyComment = ( commentText, postId, parentCommentId, options = { alsoApprove: false } ) => {
		const { translate } = this.props;
		const { alsoApprove } = options;

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
			this.setCommentStatus( parentCommentId, postId, 'approved', { showNotice: false } );
		}

		this.props.createNotice( 'is-success', noticeMessage, noticeOptions );
		this.props.replyComment( commentText, postId, parentCommentId );
	}

	setBulkStatus = status => () => {
		this.props.removeNotice( 'comment-notice-bulk' );

		this.props.setBulkStatus( keys( this.state.selectedComments ), status );

		this.showBulkNotice( status, this.state.selectedComments );

		this.setState( {
			isBulkEdit: false,
			selectedComments: {},
		} );
	};

	setCommentStatus = ( commentId, postId, status, options = { isUndo: false, doPersist: false, showNotice: true } ) => {
		const { isUndo, doPersist, showNotice } = options;

		// TODO: Replace with Redux getComment()
		const comment = this.getComment( commentId );

		if ( comment && status === comment.status ) {
			return;
		}

		if ( doPersist ) {
			this.updatePersistedComments( {
				...comment,
				i_like: 'approved' !== status ? false : comment.i_like,
				status,
			}, isUndo );
		} else {
			this.removeFromPersistedComments( commentId );
		}

		this.props.removeNotice( `comment-notice-${ commentId }` );

		if ( showNotice ) {
			this.showNotice( commentId, postId, status, comment.status, { doPersist } );
		}

		this.props.changeCommentStatus( commentId, postId, status );

		// If the comment is not approved anymore, also remove the like
		if ( 'approved' !== status ) {
			this.props.unlikeComment( commentId, postId );
		}
	}

	showBulkNotice = ( newStatus, selectedComments ) => {
		const { translate } = this.props;

		const [ type, message ] = get( {
			approved: [ 'is-success', translate( 'All selected comments approved.' ) ],
			unapproved: [ 'is-info', translate( 'All selected comments unapproved.' ) ],
			spam: [ 'is-warning', translate( 'All selected comments marked as spam.' ) ],
			trash: [ 'is-error', translate( 'All selected comments moved to trash.' ) ],
			'delete': [ 'is-error', translate( 'All selected comments deleted permanently.' ) ],
		}, newStatus, [ null, null ] );

		if ( ! type ) {
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

		this.props.createNotice( type, message, options );
	}

	showNotice = ( commentId, postId, newStatus, previousStatus, options = { doPersist: false } ) => {
		const { translate } = this.props;

		const [ type, message ] = get( {
			approved: [ 'is-success', translate( 'Comment approved.' ) ],
			unapproved: [ 'is-info', translate( 'Comment unapproved.' ) ],
			spam: [ 'is-warning', translate( 'Comment marked as spam.' ) ],
			trash: [ 'is-error', translate( 'Comment moved to trash.' ) ],
		}, newStatus, [ null, null ] );

		if ( ! type ) {
			return;
		}

		const noticeOptions = {
			button: translate( 'Undo' ),
			duration: 5000,
			id: `comment-notice-${ commentId }`,
			isPersistent: true,
			onClick: () => this.setCommentStatus( commentId, postId, previousStatus, {
				isUndo: true,
				doPersist: options.doPersist,
				showNotice: false,
			} ),
		};

		this.props.createNotice( type, message, noticeOptions );
	}

	toggleBulkEdit = () => this.setState( { isBulkEdit: ! this.state.isBulkEdit } );

	toggleCommentLike = ( commentId, postId ) => {
		// TODO: Replace with Redux getComment()
		const comment = this.getComment( commentId );
		const isPersisted = !! find( this.state.persistedComments, [ 'ID', commentId ] );

		if ( comment.i_like ) {
			this.props.unlikeComment( commentId, postId );

			if ( isPersisted ) {
				this.updatePersistedComments( {
					...comment,
					i_like: false,
				} );
			}
		} else {
			this.props.likeComment( commentId, postId );

			if ( 'unapproved' === comment.status ) {
				this.props.removeNotice( `comment-notice-${ commentId }` );
				this.setCommentStatus( commentId, postId, 'approved' );
				this.updatePersistedComments( {
					...comment,
					i_like: true,
					status: 'approved',
				} );
			} else if ( isPersisted ) {
				this.updatePersistedComments( {
					...comment,
					i_like: true,
				} );
			}
		}
	}

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

	toggleSelectAll = () => {
		this.setState( {
			selectedComments: this.isSelectedAll()
				? {}
				: keyBy( map( this.getComments(), ( { ID, i_like, status } ) => ( { ID, i_like, status } ) ), 'ID' ),
		} );
	}

	undoBulkStatus = selectedComments => {
		this.props.removeNotice( 'comment-notice-bulk' );
		this.props.undoBulkStatus( selectedComments );
	}

	updatePersistedComments = ( comment, isUndo ) => isUndo
		? this.removeFromPersistedComments( comment.ID )
		: this.setState( ( { persistedComments } ) => ( { persistedComments: [
			...reject( persistedComments, { ID: comment.ID } ),
			comment,
		] } ) );

	render() {
		const {
			commentsCount,
			commentsPage,
			isLoading,
			siteId,
			siteFragment,
			status,
		} = this.props;
		const {
			isBulkEdit,
			selectedComments,
		} = this.state;

		const comments = this.getComments();

		const zeroComments = size( comments ) <= 0;
		const showPlaceholder = ( ! siteId || isLoading ) && zeroComments;
		const showEmptyContent = zeroComments && ! showPlaceholder;

		const [ emptyMessageTitle, emptyMessageLine ] = this.getEmptyMessage();

		return (
			<div className="comment-list">
				<QuerySiteComments siteId={ siteId } status={ status } />

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
					{ map( comments, comment =>
						<CommentDetail
							comment={ comment }
							deleteCommentPermanently={ this.deleteCommentPermanently }
							isBulkEdit={ isBulkEdit }
							commentIsSelected={ this.isCommentSelected( comment.ID ) }
							key={ `comment-${ siteId }-${ comment.ID }` }
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

					{ ! showPlaceholder && ! showEmptyContent &&
						<Pagination
							key="comment-list-pagination"
							page={ commentsPage }
							pageClick={ this.changePage }
							perPage={ COMMENTS_PER_PAGE }
							total={ commentsCount }
						/>
					}
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId, status, order } ) => {
	const comments = getSiteComments( state, siteId, status, order );
	const isLoading = ! hasSiteComments( state, siteId );
	return {
		comments,
		isLoading,
		notices: getNotices( state ),
		siteId,
	};
};

const mapDispatchToProps = ( dispatch, { siteId } ) => ( {
	changeCommentStatus: ( commentId, postId, status ) => dispatch( changeCommentStatus( siteId, postId, commentId, status ) ),
	createNotice: ( status, text, options ) => dispatch( createNotice( status, text, options ) ),
	deleteComment: ( commentId, postId ) => dispatch( deleteComment( siteId, postId, commentId ) ),
	likeComment: ( commentId, postId ) => dispatch( likeComment( siteId, postId, commentId ) ),
	removeNotice: noticeId => dispatch( removeNotice( noticeId ) ),
	replyComment: ( commentText, postId, parentCommentId ) => dispatch( replyComment( commentText, siteId, postId, parentCommentId ) ),
	setBulkStatus: noop,
	undoBulkStatus: noop,
	unlikeComment: ( commentId, postId ) => dispatch( unlikeComment( siteId, postId, commentId ) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentList ) );
