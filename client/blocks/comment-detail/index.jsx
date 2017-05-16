/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { noop } from 'lodash';

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
		authorEmail: PropTypes.string,
		authorId: PropTypes.number,
		authorIp: PropTypes.string,
		authorIsBlocked: PropTypes.bool,
		authorUrl: PropTypes.string,
		authorUsername: PropTypes.string,
		commentContent: PropTypes.string,
		commentDate: PropTypes.string,
		commentId: PropTypes.number,
		commentIsApproved: PropTypes.bool,
		commentIsLiked: PropTypes.bool,
		commentIsSpam: PropTypes.bool,
		commentIsTrash: PropTypes.bool,
		postAuthorDisplayName: PropTypes.string,
		postTitle: PropTypes.string,
		postUrl: PropTypes.string,
		repliedToComment: PropTypes.bool,
		siteIcon: PropTypes.string,
		siteName: PropTypes.string,
	};

	state = {
		authorIsBlocked: false,
		isApproved: false,
		isExpanded: false,
		isLiked: false,
		isSpam: false,
		isTrash: false,
	};

	componentWillMount() {
		const {
			authorIsBlocked,
			commentIsApproved,
			commentIsLiked,
			commentIsSpam,
			commentIsTrash,
		} = this.props;
		this.setState( {
			authorIsBlocked,
			isApproved: commentIsApproved,
			isLiked: commentIsLiked,
			isSpam: commentIsSpam,
			isTrash: commentIsTrash,
		} );
	}

	blockUser = () => {
		this.setState( { authorIsBlocked: ! this.state.authorIsBlocked } );
	};

	edit = () => noop;

	toggleApprove = () => {
		this.setState( { isApproved: ! this.state.isApproved } );
	};

	toggleExpanded = () => {
		this.setState( { isExpanded: ! this.state.isExpanded } );
	}

	toggleLike = () => {
		this.setState( { isLiked: ! this.state.isLiked } );
	};

	toggleSpam = () => {
		this.setState( { isSpam: ! this.state.isSpam } );
	};

	toggleTrash = () => {
		this.setState( { isTrash: ! this.state.isTrash } );
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
			postAuthorDisplayName,
			postTitle,
			postUrl,
			repliedToComment,
			siteIcon,
			siteName,
		} = this.props;

		const {
			authorIsBlocked,
			isApproved,
			isExpanded,
			isLiked,
			isSpam,
			isTrash,
		} = this.state;

		const classes = classNames( 'comment-detail', {
			'author-is-blocked': authorIsBlocked,
			'is-approved': isApproved,
			'is-expanded': isExpanded,
			'is-liked': isLiked,
			'is-spam': isSpam,
			'is-trash': isTrash,
		} );

		return (
			<Card is-compact className={ classes }>
				<CommentDetailHeader
					authorAvatarUrl={ authorAvatarUrl }
					authorDisplayName={ authorDisplayName }
					authorUrl={ authorUrl }
					commentContent={ commentContent }
					commentIsApproved={ isApproved }
					commentIsLiked={ isLiked }
					commentIsSpam={ isSpam }
					commentIsTrash={ isTrash }
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
							siteIcon={ siteIcon }
							siteName={ siteName }
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

export default CommentDetail;
