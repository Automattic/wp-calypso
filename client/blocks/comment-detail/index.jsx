/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { get, isUndefined, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CommentDetailComment from './comment-detail-comment';
import CommentDetailHeader from './comment-detail-header';
import CommentDetailPost from './comment-detail-post';
import CommentDetailReply from './comment-detail-reply';
import { decodeEntities, stripHTML } from 'lib/formatting';
import { getPostCommentsTree } from 'state/comments/selectors';

export class CommentDetail extends Component {
	static propTypes = {
		authorAvatarUrl: PropTypes.string,
		authorDisplayName: PropTypes.string,
		authorEmail: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.string ] ),
		authorId: PropTypes.number,
		authorIp: PropTypes.string,
		authorIsBlocked: PropTypes.bool,
		authorUrl: PropTypes.string,
		authorUsername: PropTypes.string,
		commentContent: PropTypes.string,
		commentDate: PropTypes.string,
		commentId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		commentIsLiked: PropTypes.bool,
		commentIsSelected: PropTypes.bool,
		commentStatus: PropTypes.string,
		commentUrl: PropTypes.string,
		deleteCommentPermanently: PropTypes.func,
		isBulkEdit: PropTypes.bool,
		postAuthorDisplayName: PropTypes.string,
		postTitle: PropTypes.string,
		repliedToComment: PropTypes.bool,
		replyComment: PropTypes.func,
		setCommentStatus: PropTypes.func,
		siteId: PropTypes.number,
		submitComment: PropTypes.func,
		toggleCommentLike: PropTypes.func,
		toggleCommentSelected: PropTypes.func,
	};

	static defaultProps = {
		commentIsSelected: false,
		isBulkEdit: false,
	};

	state = {
		authorIsBlocked: false,
	};

	componentWillMount() {
		const { authorIsBlocked } = this.props;
		this.setState( { authorIsBlocked } );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.isBulkEdit && ! this.props.isBulkEdit ) {
			this.setState( { isExpanded: false } );
		}
	}

	blockUser = () => {
		this.setState( { authorIsBlocked: ! this.state.authorIsBlocked } );
	}

	deleteCommentPermanently = () => {
		const { commentId, deleteCommentPermanently, postId, translate } = this.props;
		if ( isUndefined( window ) || window.confirm( translate( 'Delete this comment permanently?' ) ) ) {
			deleteCommentPermanently( commentId, postId );
		}
	}

	edit = () => noop;

	toggleApprove = () => {
		const { commentId, commentStatus, postId, setCommentStatus } = this.props;
		setCommentStatus( commentId, postId, 'approved' === commentStatus ? 'unapproved' : 'approved' );
	}

	toggleExpanded = () => {
		this.setState( { isExpanded: ! this.state.isExpanded } );
	}

	toggleLike = () => {
		const { commentId, postId, toggleCommentLike } = this.props;
		toggleCommentLike( commentId, postId );
	}

	toggleSelected = () => {
		const { commentId, toggleCommentSelected } = this.props;
		toggleCommentSelected( commentId );
	}

	toggleSpam = () => {
		const { commentId, commentStatus, postId, setCommentStatus } = this.props;
		setCommentStatus( commentId, postId, 'spam' === commentStatus ? 'approved' : 'spam' );
	}

	toggleTrash = () => {
		const { commentId, commentStatus, postId, setCommentStatus } = this.props;
		setCommentStatus( commentId, postId, 'trash' === commentStatus ? 'approved' : 'trash' );
	}

	render() {
		const {
			authorAvatarUrl,
			authorDisplayName,
			authorEmail,
			authorIp,
			authorUrl,
			authorUsername,
			commentContent,
			commentDate,
			commentId,
			commentIsLiked,
			commentIsSelected,
			commentStatus,
			commentUrl,
			isBulkEdit,
			parentCommentAuthorAvatarUrl,
			parentCommentAuthorDisplayName,
			parentCommentContent,
			parentCommentUrl,
			postAuthorDisplayName,
			postId,
			postTitle,
			repliedToComment,
			replyComment,
			siteId,
		} = this.props;

		const postUrl = `/read/blogs/${ siteId }/posts/${ postId }`;

		const {
			authorIsBlocked,
			isExpanded,
		} = this.state;

		const classes = classNames( 'comment-detail', {
			'author-is-blocked': authorIsBlocked,
			'is-approved': 'approved' === commentStatus,
			'is-unapproved': 'unapproved' === commentStatus,
			'is-bulk-edit': isBulkEdit,
			'is-expanded': isExpanded,
			'is-collapsed': ! isExpanded,
			'is-liked': commentIsLiked,
			'is-spam': 'spam' === commentStatus,
			'is-trash': 'trash' === commentStatus,
		} );

		return (
			<Card className={ classes }>
				<CommentDetailHeader
					siteId={ siteId }
					postId={ postId }
					commentId={ commentId }
					authorAvatarUrl={ authorAvatarUrl }
					authorDisplayName={ authorDisplayName }
					authorUrl={ authorUrl }
					commentContent={ commentContent }
					commentIsSelected={ commentIsSelected }
					commentStatus={ commentStatus }
					deleteCommentPermanently={ this.deleteCommentPermanently }
					isBulkEdit={ isBulkEdit }
					isExpanded={ isExpanded }
					postTitle={ postTitle }
					toggleApprove={ this.toggleApprove }
					toggleExpanded={ this.toggleExpanded }
					toggleSelected={ this.toggleSelected }
					toggleSpam={ this.toggleSpam }
					toggleTrash={ this.toggleTrash }
				/>
				{ isExpanded &&
					<div className="comment-detail__content">
						<CommentDetailPost
							parentCommentAuthorAvatarUrl={ parentCommentAuthorAvatarUrl }
							parentCommentAuthorDisplayName={ parentCommentAuthorDisplayName }
							parentCommentContent={ parentCommentContent }
							parentCommentUrl={ parentCommentUrl }
							postAuthorDisplayName={ postAuthorDisplayName }
							postTitle={ postTitle }
							postUrl={ postUrl }
							siteId={ siteId }
						/>
						<CommentDetailComment
							authorAvatarUrl={ authorAvatarUrl }
							authorDisplayName={ authorDisplayName }
							authorEmail={ authorEmail }
							authorIp={ authorIp }
							authorIsBlocked={ authorIsBlocked }
							authorUrl={ authorUrl }
							authorUsername={ authorUsername }
							blockUser={ this.blockUser }
							commentContent={ commentContent }
							commentDate={ commentDate }
							commentStatus={ commentStatus }
							commentUrl={ commentUrl }
							repliedToComment={ repliedToComment }
							siteId={ siteId }
						/>
						<CommentDetailReply
							authorDisplayName={ authorDisplayName }
							commentId={ commentId }
							commentStatus={ commentStatus }
							postId={ postId }
							postTitle={ postTitle }
							replyComment={ replyComment }
						/>
					</div>
				}
			</Card>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	// TODO: replace `const comment = ownProps.comment;` with
	// `const comment = ownProps.comment || getComment( ownProps.commentId );`
	// when the selector is ready.
	const {
		comment,
		siteId,
	} = ownProps;

	const postId = get( comment, 'post.ID' );

	// TODO: eventually it will be returned already decoded from the data layer.
	const postTitle = decodeEntities( get( comment, 'post.title' ) );

	const commentsTree = getPostCommentsTree( state, siteId, postId, 'all' );
	const parentCommentId = get( commentsTree, [ comment.ID, 'data', 'parent', 'ID' ], 0 );
	const parentComment = get( commentsTree, [ parentCommentId, 'data' ], {} );

	// TODO: eventually it will be returned already decoded from the data layer.
	const parentCommentContent = decodeEntities( stripHTML( get( parentComment, 'content' ) ) );

	return ( {
		authorAvatarUrl: get( comment, 'author.avatar_URL' ),
		authorDisplayName: get( comment, 'author.name' ),
		authorEmail: get( comment, 'author.email' ),
		authorId: get( comment, 'author.ID' ),
		authorIp: get( comment, 'author.ip' ), // TODO: not available in the current data structure
		authorIsBlocked: get( comment, 'author.isBlocked' ), // TODO: not available in the current data structure
		authorUrl: get( comment, 'author.URL' ),
		authorUsername: get( comment, 'author.nice_name' ),
		commentContent: comment.content,
		commentDate: comment.date,
		commentId: comment.ID,
		commentIsLiked: comment.i_like,
		commentStatus: comment.status,
		commentUrl: get( comment, 'URL' ),
		parentCommentAuthorAvatarUrl: get( parentComment, 'author.avatar_URL' ),
		parentCommentAuthorDisplayName: get( parentComment, 'author.name' ),
		parentCommentContent,
		parentCommentUrl: get( parentComment, 'URL' ),
		postAuthorDisplayName: get( comment, 'post.author.name' ), // TODO: not available in the current data structure
		postId,
		postTitle,
		repliedToComment: comment.replied, // TODO: not available in the current data structure
		siteId: comment.siteId || siteId,
	} );
};

export default connect( mapStateToProps )( localize( CommentDetail ) );
