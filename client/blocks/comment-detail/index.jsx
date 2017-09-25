/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, isUndefined } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CommentDetailComment from './comment-detail-comment';
import CommentDetailEdit from './comment-detail-edit';
import CommentDetailHeader from './comment-detail-header';
import CommentDetailPost from './comment-detail-post';
import CommentDetailReply from './comment-detail-reply';
import Card from 'components/card';
import QueryComment from 'components/data/query-comment';
import { decodeEntities, stripHTML } from 'lib/formatting';
import { getPostCommentsTree } from 'state/comments/selectors';
import getSiteComment from 'state/selectors/get-site-comment';
import { isJetpackMinimumVersion, isJetpackSite } from 'state/sites/selectors';

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
		isRawContentSupported: PropTypes.bool,
		postAuthorDisplayName: PropTypes.string,
		postTitle: PropTypes.string,
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
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.isBulkEdit && ! this.props.isBulkEdit ) {
			this.setState( { isExpanded: false } );
		}
	}

	deleteCommentPermanently = () => {
		if ( this.state.isEditMode ) {
			return;
		}

		const { commentId, deleteCommentPermanently, postId, translate } = this.props;
		if ( isUndefined( window ) || window.confirm( translate( 'Delete this comment permanently?' ) ) ) {
			deleteCommentPermanently( commentId, postId );
		}
	}

	isAuthorBlacklisted = () => ( !! this.props.authorEmail && !! this.props.siteBlacklist )
		? -1 !== this.props.siteBlacklist.split( '\n' ).indexOf( this.props.authorEmail )
		: false;

	toggleApprove = () => {
		if ( this.state.isEditMode ) {
			return;
		}

		const { commentStatus, setCommentStatus } = this.props;
		const shouldPersist = 'approved' === commentStatus || 'unapproved' === commentStatus;

		setCommentStatus(
			getCommentStatusAction( this.props ),
			( 'approved' === commentStatus ) ? 'unapproved' : 'approved',
			{
				doPersist: shouldPersist,
				showNotice: true,
			}
		);

		if ( shouldPersist ) {
			this.setState( { isExpanded: false } );
		}
	}

	toggleEditMode = () => this.setState( ( { isEditMode } ) => ( { isEditMode: ! isEditMode } ) );

	toggleExpanded = () => {
		if ( ! this.props.isLoading && ! this.state.isEditMode ) {
			this.setState( ( { isExpanded } ) => ( { isExpanded: ! isExpanded } ) );
		}
	}

	toggleLike = () => {
		if ( this.state.isEditMode ) {
			return;
		}

		this.props.toggleCommentLike( getCommentStatusAction( this.props ) );
	}

	toggleSelected = () => this.props.toggleCommentSelected( getCommentStatusAction( this.props ) );

	toggleSpam = () => {
		if ( this.state.isEditMode ) {
			return;
		}

		const { commentStatus, setCommentStatus } = this.props;
		setCommentStatus(
			getCommentStatusAction( this.props ),
			( 'spam' === commentStatus ) ? 'approved' : 'spam'
		);
	}

	toggleTrash = () => {
		if ( this.state.isEditMode ) {
			return;
		}

		const { commentStatus, setCommentStatus } = this.props;
		setCommentStatus(
			getCommentStatusAction( this.props ),
			( 'trash' === commentStatus ) ? 'approved' : 'trash'
		);
	}

	setCardRef = card => {
		this.commentCard = card;
	}

	keyHandler = event => {
		const commentHasFocus = document && this.commentCard && document.activeElement === ReactDom.findDOMNode( this.commentCard );
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
	}

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

		const postUrl = `/read/blogs/${ siteId }/posts/${ postId }`;
		const authorDisplayName = authorName || translate( 'Anonymous' );
		const authorIsBlocked = this.isAuthorBlacklisted();

		const {
			isEditMode,
			isExpanded,
		} = this.state;

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
				{ refreshCommentData &&
					<QueryComment commentId={ commentId } siteId={ siteId } />
				}

				<CommentDetailHeader
					authorAvatarUrl={ authorAvatarUrl }
					authorDisplayName={ authorDisplayName }
					authorUrl={ authorUrl }
					commentContent={ commentContent }
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
					toggleSelected={ this.toggleSelected }
					toggleSpam={ this.toggleSpam }
					toggleTrash={ this.toggleTrash }
				/>
				{ isExpanded &&
					<div className="comment-detail__content">
						<CommentDetailPost
							commentId={ commentId }
							parentCommentAuthorAvatarUrl={ parentCommentAuthorAvatarUrl }
							parentCommentAuthorDisplayName={ parentCommentAuthorDisplayName }
							parentCommentContent={ parentCommentContent }
							postAuthorDisplayName={ postAuthorDisplayName }
							postTitle={ postTitle }
							postUrl={ postUrl }
							siteId={ siteId }
						/>

						{ isEditMode &&
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
						}

						{ ! isEditMode &&
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
									postTitle={ postTitle }
									replyComment={ replyComment }
								/>
							</div>
						}
					</div>
				}
			</Card>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const { commentId, siteId } = ownProps;
	const comment = ownProps.comment || getSiteComment( state, siteId, commentId );

	const isLoading = isUndefined( comment );

	const postId = get( comment, 'post.ID' );

	// TODO: eventually it will be returned already decoded from the data layer.
	const postTitle = decodeEntities( get( comment, 'post.title' ) );

	const commentsTree = getPostCommentsTree( state, siteId, postId, 'all' );
	const parentCommentId = get( commentsTree, [ commentId, 'data', 'parent', 'ID' ], 0 );
	const parentComment = get( commentsTree, [ parentCommentId, 'data' ], {} );

	// TODO: eventually it will be returned already decoded from the data layer.
	const parentCommentContent = decodeEntities( stripHTML( get( parentComment, 'content' ) ) );

	const authorName = decodeEntities( get( comment, 'author.name' ) );

	return ( {
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
		isEditCommentSupported: ! isJetpackSite( state, siteId ) || isJetpackMinimumVersion( state, siteId, '5.3' ),
		isLoading,
		parentCommentAuthorAvatarUrl: get( parentComment, 'author.avatar_URL' ),
		parentCommentAuthorDisplayName: get( parentComment, 'author.name' ),
		parentCommentContent,
		postAuthorDisplayName: get( comment, 'post.author.name' ), // TODO: not available in the current data structure
		postId,
		postTitle,
		repliedToComment: get( comment, 'replied' ), // TODO: not available in the current data structure
		siteId: get( comment, 'siteId', siteId ),
	} );
};

export default connect( mapStateToProps )( localize( CommentDetail ) );
