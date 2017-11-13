/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { get, isUndefined } from 'lodash';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import QueryComment from 'components/data/query-comment';
import QueryPosts from 'components/data/query-posts';
import CommentDetailComment from './comment-detail-comment';
import CommentDetailEdit from './comment-detail-edit';
import CommentDetailHeader from './comment-detail-header';
import CommentDetailPost from './comment-detail-post';
import CommentDetailReply from './comment-detail-reply';
import { decodeEntities, stripHTML } from 'lib/formatting';
import { getPostCommentsTree } from 'state/comments/selectors';
import { getSitePost } from 'state/posts/selectors';
import getSiteComment from 'state/selectors/get-site-comment';
import { isJetpackMinimumVersion, isJetpackSite } from 'state/sites/selectors';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import config from 'config';

/**
 * Creates a stripped down comment object containing only the information needed by
 * CommentList's change status functions and their respective undos.
 *
 * @param {Object} props The CommentDetail props object.
 * @param {Number} props.commentId The comment ID.
 * @param {Boolean} props.commentIsLiked The current comment i_like value.
 * @param {String} props.commentStatus The current comment status.
 * @param {Number} props.postId The comment's post ID.
 * @returns {Object} A stripped down comment object.
 */
const getCommentStatusAction = ( { commentId, commentIsLiked, commentStatus, postId } ) => ( {
	commentId,
	isLiked: commentIsLiked,
	postId,
	status: commentStatus,
} );

export class CommentDetail extends Component {
	static propTypes = {
		authorAvatarUrl: PropTypes.string,
		authorEmail: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.string ] ),
		authorId: PropTypes.number,
		authorIp: PropTypes.string,
		authorName: PropTypes.string,
		authorUrl: PropTypes.string,
		authorUsername: PropTypes.string,
		commentContent: PropTypes.string,
		commentDate: PropTypes.string,
		commentId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		commentIsLiked: PropTypes.bool,
		commentIsSelected: PropTypes.bool,
		commentRawContent: PropTypes.string,
		commentStatus: PropTypes.string,
		commentUrl: PropTypes.string,
		deleteCommentPermanently: PropTypes.func,
		editComment: PropTypes.func,
		isBulkEdit: PropTypes.bool,
		isLoading: PropTypes.bool,
		isJetpack: PropTypes.bool,
		isRawContentSupported: PropTypes.bool,
		postAuthorDisplayName: PropTypes.string,
		postTitle: PropTypes.string,
		postUrl: PropTypes.string,
		recordReaderArticleOpened: PropTypes.func,
		recordReaderCommentOpened: PropTypes.func,
		refreshCommentData: PropTypes.bool,
		repliedToComment: PropTypes.bool,
		replyComment: PropTypes.func,
		setCommentStatus: PropTypes.func,
		siteBlacklist: PropTypes.string,
		siteId: PropTypes.number,
		toggleCommentLike: PropTypes.func,
		toggleCommentSelected: PropTypes.func,
	};

	static defaultProps = {
		commentIsSelected: false,
		isBulkEdit: false,
		isLoading: true,
		refreshCommentData: false,
	};

	state = {
		isEditMode: false,
		isReplyMode: false,
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.isBulkEdit && ! this.props.isBulkEdit ) {
			this.setState( { isExpanded: false } );
		}
	}

	deleteCommentPermanently = e => {
		e.stopPropagation();

		if ( this.state.isEditMode ) {
			return;
		}

		const { commentId, deleteCommentPermanently, postId, translate } = this.props;
		if (
			isUndefined( window ) ||
			window.confirm( translate( 'Delete this comment permanently?' ) )
		) {
			deleteCommentPermanently( commentId, postId );
		}
	};

	isAuthorBlacklisted = () =>
		!! this.props.authorEmail && !! this.props.siteBlacklist
			? -1 !== this.props.siteBlacklist.split( '\n' ).indexOf( this.props.authorEmail )
			: false;

	enterReplyState = () => this.setState( { isReplyMode: true } );

	exitReplyState = () => this.setState( { isReplyMode: false } );

	getPostUrl = () => {
		const { commentStatus, postId, postUrl, siteSlug } = this.props;

		if ( ! config.isEnabled( 'comments/management/post-view' ) ) {
			return postUrl;
		}

		const status = 'unapproved' === commentStatus ? 'pending' : commentStatus;

		return `/comments/${ status }/${ siteSlug }/${ postId }`;
	};

	toggleApprove = e => {
		e.stopPropagation();

		if ( this.state.isEditMode ) {
			return;
		}

		const { commentStatus, setCommentStatus } = this.props;
		const shouldPersist = 'approved' === commentStatus || 'unapproved' === commentStatus;

		setCommentStatus(
			getCommentStatusAction( this.props ),
			'approved' === commentStatus ? 'unapproved' : 'approved',
			{
				doPersist: shouldPersist,
				showNotice: true,
			}
		);

		if ( shouldPersist ) {
			this.setState( { isExpanded: false } );
		}
	};

	toggleEditMode = () => this.setState( ( { isEditMode } ) => ( { isEditMode: ! isEditMode } ) );

	toggleExpanded = () => {
		if ( ! this.props.isLoading && ! this.state.isEditMode ) {
			this.setState( ( { isExpanded } ) => ( { isExpanded: ! isExpanded } ) );
		}
	};

	toggleSelected = () => this.props.toggleCommentSelected( getCommentStatusAction( this.props ) );

	toggleLike = e => {
		e.stopPropagation();

		if ( this.state.isEditMode ) {
			return;
		}

		this.props.toggleCommentLike( getCommentStatusAction( this.props ) );
	};

	toggleSpam = e => {
		e.stopPropagation();

		if ( this.state.isEditMode ) {
			return;
		}

		const { commentStatus, setCommentStatus } = this.props;
		setCommentStatus(
			getCommentStatusAction( this.props ),
			'spam' === commentStatus ? 'approved' : 'spam'
		);
	};

	toggleTrash = e => {
		e.stopPropagation();

		if ( this.state.isEditMode ) {
			return;
		}

		const { commentStatus, setCommentStatus } = this.props;
		setCommentStatus(
			getCommentStatusAction( this.props ),
			'trash' === commentStatus ? 'approved' : 'trash'
		);
	};

	setCardRef = card => {
		this.commentCard = card;
	};

	keyHandler = event => {
		const commentHasFocus =
			document &&
			this.commentCard &&
			document.activeElement === ReactDom.findDOMNode( this.commentCard );
		if ( this.state.isEditMode || ( this.state.isExpanded && ! commentHasFocus ) ) {
			return;
		}
		switch ( event.keyCode ) {
			case 32: // space
			case 13: // enter
				event.preventDefault();
				this.toggleExpanded();
				break;
		}
	};

	trackDeepReaderLinkClick = () => {
		const { isJetpack, parentCommentContent } = this.props;
		if ( isJetpack || config.isEnabled( 'comments/management/post-view' ) ) {
			return;
		}
		if ( parentCommentContent ) {
			return this.props.recordReaderCommentOpened();
		}
		this.props.recordReaderArticleOpened();
	};

	render() {
		const {
			authorAvatarUrl,
			authorEmail,
			authorId,
			authorIp,
			authorName,
			authorUrl,
			authorUsername,
			commentContent,
			commentDate,
			commentId,
			commentIsLiked,
			commentIsSelected,
			commentRawContent,
			commentStatus,
			commentType,
			commentUrl,
			editComment,
			isBulkEdit,
			isEditCommentSupported,
			isLoading,
			isPostTitleLoaded,
			parentCommentAuthorAvatarUrl,
			parentCommentAuthorDisplayName,
			parentCommentContent,
			postAuthorDisplayName,
			postId,
			postTitle,
			refreshCommentData,
			repliedToComment,
			replyComment,
			siteBlacklist,
			siteId,
			translate,
		} = this.props;

		const { isEditMode, isExpanded } = this.state;

		const authorDisplayName = authorName || translate( 'Anonymous' );
		const authorIsBlocked = this.isAuthorBlacklisted();

		const classes = classNames( 'comment-detail', {
			'author-is-blocked': authorIsBlocked,
			'comment-detail__placeholder': isLoading,
			'is-approved': 'approved' === commentStatus,
			'is-unapproved': 'unapproved' === commentStatus,
			'is-bulk-edit': isBulkEdit,
			'is-edit-mode': isEditMode,
			'is-expanded': isExpanded,
			'is-collapsed': ! isExpanded,
			'is-liked': commentIsLiked,
			'is-spam': 'spam' === commentStatus,
			'is-trash': 'trash' === commentStatus,
		} );

		return (
			<Card
				onKeyDown={ this.keyHandler }
				ref={ this.setCardRef }
				className={ classes }
				tabIndex="0"
			>
				{ refreshCommentData && (
					<QueryComment commentId={ commentId } siteId={ siteId } forceWpcom />
				) }

				{ ! isPostTitleLoaded && <QueryPosts siteId={ siteId } postId={ postId } /> }

				<CommentDetailHeader
					authorAvatarUrl={ authorAvatarUrl }
					authorDisplayName={ authorDisplayName }
					authorUrl={ authorUrl }
					commentContent={ commentContent }
					commentDate={ commentDate }
					commentIsLiked={ commentIsLiked }
					commentIsSelected={ commentIsSelected }
					commentStatus={ commentStatus }
					commentType={ commentType }
					deleteCommentPermanently={ this.deleteCommentPermanently }
					isBulkEdit={ isBulkEdit }
					isEditMode={ isEditMode }
					isExpanded={ isExpanded }
					postId={ postId }
					postTitle={ postTitle }
					toggleApprove={ this.toggleApprove }
					toggleEditMode={ this.toggleEditMode }
					toggleExpanded={ this.toggleExpanded }
					toggleLike={ this.toggleLike }
					toggleReply={ this.enterReplyState }
					toggleSelected={ this.toggleSelected }
					toggleSpam={ this.toggleSpam }
					toggleTrash={ this.toggleTrash }
				/>
				{ isExpanded && (
					<div className="comment-detail__content">
						<CommentDetailPost
							commentId={ commentId }
							parentCommentAuthorAvatarUrl={ parentCommentAuthorAvatarUrl }
							parentCommentAuthorDisplayName={ parentCommentAuthorDisplayName }
							parentCommentContent={ parentCommentContent }
							postAuthorDisplayName={ postAuthorDisplayName }
							postTitle={ postTitle }
							postUrl={ this.getPostUrl() }
							siteId={ siteId }
							onClick={ this.trackDeepReaderLinkClick }
						/>

						{ isEditMode && (
							<CommentDetailEdit
								authorDisplayName={ authorDisplayName }
								authorUrl={ authorUrl }
								closeEditMode={ this.toggleEditMode }
								commentContent={ isEditCommentSupported ? commentRawContent : commentContent }
								commentId={ commentId }
								editComment={ editComment }
								isAuthorRegistered={ authorId !== 0 }
								isEditCommentSupported={ isEditCommentSupported }
								postId={ postId }
								siteId={ siteId }
							/>
						) }

						{ ! isEditMode && (
							<div>
								<CommentDetailComment
									authorAvatarUrl={ authorAvatarUrl }
									authorDisplayName={ authorDisplayName }
									authorEmail={ authorEmail }
									authorId={ authorId }
									authorIp={ authorIp }
									authorIsBlocked={ authorIsBlocked }
									authorUrl={ authorUrl }
									authorUsername={ authorUsername }
									commentContent={ commentContent }
									commentDate={ commentDate }
									commentId={ commentId }
									commentStatus={ commentStatus }
									commentType={ commentType }
									commentUrl={ commentUrl }
									repliedToComment={ repliedToComment }
									siteBlacklist={ siteBlacklist }
									siteId={ siteId }
								/>
								<CommentDetailReply
									authorAvatarUrl={ authorAvatarUrl }
									authorDisplayName={ authorDisplayName }
									comment={ getCommentStatusAction( this.props ) }
									hasFocus={ this.state.isReplyMode }
									replyComment={ replyComment }
									enterReplyState={ this.enterReplyState }
									exitReplyState={ this.exitReplyState }
								/>
							</div>
						) }
					</div>
				) }
			</Card>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const { commentId, siteId } = ownProps;
	const comment = ownProps.comment || getSiteComment( state, siteId, commentId );

	const isLoading = isUndefined( comment );

	const postId = get( comment, 'post.ID' );

	const post = getSitePost( state, siteId, postId );

	const postTitle =
		decodeEntities( get( comment, 'post.title' ) ) ||
		decodeEntities( stripHTML( get( post, 'excerpt' ) ) );

	const commentsTree = getPostCommentsTree( state, siteId, postId, 'all' );
	const parentCommentId = get( commentsTree, [ commentId, 'data', 'parent', 'ID' ], 0 );
	const parentComment = get( commentsTree, [ parentCommentId, 'data' ], {} );

	// TODO: eventually it will be returned already decoded from the data layer.
	const parentCommentContent = decodeEntities( stripHTML( get( parentComment, 'content' ) ) );

	const authorName = decodeEntities( get( comment, 'author.name' ) );

	const isJetpack = isJetpackSite( state, siteId );

	return {
		authorAvatarUrl: get( comment, 'author.avatar_URL' ),
		authorEmail: get( comment, 'author.email' ),
		authorId: get( comment, 'author.ID' ),
		authorIp: get( comment, 'author.ip_address' ),
		authorName,
		authorUrl: get( comment, 'author.URL', '' ),
		authorUsername: get( comment, 'author.nice_name' ),
		commentContent: get( comment, 'content' ),
		commentDate: get( comment, 'date' ),
		commentId,
		commentIsLiked: get( comment, 'i_like' ),
		commentRawContent: get( comment, 'raw_content' ),
		commentStatus: get( comment, 'status' ),
		commentType: get( comment, 'type', 'comment' ),
		commentUrl: get( comment, 'URL' ),
		isEditCommentSupported: ! isJetpack || isJetpackMinimumVersion( state, siteId, '5.3' ),
		isJetpack,
		isLoading,
		isPostTitleLoaded: !! postTitle || !! post,
		parentCommentAuthorAvatarUrl: get( parentComment, 'author.avatar_URL' ),
		parentCommentAuthorDisplayName: get( parentComment, 'author.name' ),
		parentCommentContent,
		postAuthorDisplayName: get( comment, 'post.author.name' ), // TODO: not available in the current data structure
		postId,
		postUrl: isJetpack ? get( comment, 'URL' ) : `/read/blogs/${ siteId }/posts/${ postId }`,
		postTitle,
		repliedToComment: get( comment, 'replied' ), // TODO: not available in the current data structure
		siteSlug: getSelectedSiteSlug( state ),
		siteId: get( comment, 'siteId', siteId ),
	};
};

const mapDispatchToProps = dispatch => ( {
	recordReaderArticleOpened: () =>
		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_comment_management_article_opened' ),
				bumpStat( 'calypso_comment_management', 'article_opened' )
			)
		),
	recordReaderCommentOpened: () =>
		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_comment_management_comment_opened' ),
				bumpStat( 'calypso_comment_management', 'comment_opened' )
			)
		),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentDetail ) );
