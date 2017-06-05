/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CommentDetailComment from './comment-detail-comment';
import CommentDetailHeader from './comment-detail-header';
import CommentDetailPost from './comment-detail-post';
import CommentDetailReply from './comment-detail-reply';

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
		commentId: PropTypes.number,
		commentIsLiked: PropTypes.bool,
		commentStatus: PropTypes.string,
		deleteCommentPermanently: PropTypes.func,
		isBulkEdit: PropTypes.bool,
		postAuthorDisplayName: PropTypes.string,
		postTitle: PropTypes.string,
		postUrl: PropTypes.string,
		repliedToComment: PropTypes.bool,
		setCommentStatus: PropTypes.func,
		siteId: PropTypes.number,
		toggleCommentLike: PropTypes.func,
	};

	static defaultProps = {
		isBulkEdit: false,
	};

	state = {
		authorIsBlocked: false,
	};

	componentWillMount() {
		const {
			authorIsBlocked,
			commentIsLiked,
		} = this.props;
		this.setState( {
			authorIsBlocked,
			isLiked: commentIsLiked,
		} );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.isBulkEdit && ! this.props.isBulkEdit ) {
			this.setState( { isExpanded: false } );
		}
	}

	blockUser = () => {
		this.setState( { authorIsBlocked: ! this.state.authorIsBlocked } );
	};

	edit = () => noop;

	toggleApprove = () => {
		const { commentId, commentStatus, setCommentStatus } = this.props;
		setCommentStatus( commentId, 'approved' === commentStatus ? 'unapproved' : 'approved' );
	};

	toggleExpanded = () => {
		this.setState( { isExpanded: ! this.state.isExpanded } );
	}

	toggleLike = () => {
		const { commentId, toggleCommentLike } = this.props;
		toggleCommentLike( commentId );
	};

	toggleSpam = () => {
		const { commentId, commentStatus, setCommentStatus } = this.props;
		setCommentStatus( commentId, 'spam' === commentStatus ? 'approved' : 'spam' );
	};

	toggleTrash = () => {
		const { commentId, commentStatus, setCommentStatus } = this.props;
		setCommentStatus( commentId, 'trash' === commentStatus ? 'approved' : 'trash' );
	};

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
			commentIsLiked,
			commentStatus,
			deleteCommentPermanently,
			isBulkEdit,
			postAuthorDisplayName,
			postTitle,
			postUrl,
			repliedToComment,
			siteId,
		} = this.props;

		const {
			authorIsBlocked,
			isExpanded,
		} = this.state;

		const classes = classNames( 'comment-detail', {
			'author-is-blocked': authorIsBlocked,
			'is-approved': 'approved' === commentStatus,
			'is-bulk-edit': isBulkEdit,
			'is-expanded': isExpanded,
			'is-liked': commentIsLiked,
			'is-spam': 'spam' === commentStatus,
			'is-trash': 'trash' === commentStatus,
		} );

		return (
			<Card className={ classes }>
				<CommentDetailHeader
					authorAvatarUrl={ authorAvatarUrl }
					authorDisplayName={ authorDisplayName }
					authorUrl={ authorUrl }
					commentContent={ commentContent }
					commentIsLiked={ commentIsLiked }
					commentStatus={ commentStatus }
					deleteCommentPermanently={ deleteCommentPermanently }
					isBulkEdit={ isBulkEdit }
					isExpanded={ isExpanded }
					toggleApprove={ this.toggleApprove }
					toggleExpanded={ this.toggleExpanded }
					toggleLike={ this.toggleLike }
					toggleSpam={ this.toggleSpam }
					toggleTrash={ this.toggleTrash }
				/>
				{ isExpanded &&
					<div className="comment-detail__content">
						<CommentDetailPost
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
							repliedToComment={ repliedToComment }
						/>
						<CommentDetailReply />
					</div>
				}
			</Card>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	authorAvatarUrl: get( ownProps, 'author.avatar_URL' ),
	authorDisplayName: get( ownProps, 'author.name' ),
	authorEmail: get( ownProps, 'author.email' ),
	authorId: get( ownProps, 'author.ID' ),
	authorIp: get( ownProps, 'author.ip' ), // TODO: not available in the current data structure
	authorIsBlocked: get( ownProps, 'author.isBlocked' ), // TODO: not available in the current data structure
	authorUrl: get( ownProps, 'author.URL' ),
	authorUsername: get( ownProps, 'author.nice_name' ),
	commentContent: ownProps.content,
	commentDate: ownProps.date,
	commentId: ownProps.ID,
	commentIsLiked: ownProps.i_like,
	commentStatus: ownProps.status,
	postAuthorDisplayName: get( ownProps, 'post.author.name' ),
	postTitle: get( ownProps, 'post.title' ),
	postUrl: get( ownProps, 'post.link' ),
	repliedToComment: ownProps.replied, // TODO: not available in the current data structure
	siteId: ownProps.siteId,
} );

export default connect( mapStateToProps )( CommentDetail );
