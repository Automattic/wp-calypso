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
		commentIsApproved: PropTypes.bool,
		commentIsLiked: PropTypes.bool,
		commentIsSpam: PropTypes.bool,
		commentIsTrash: PropTypes.bool,
		isBulkEdit: PropTypes.bool,
		postAuthorDisplayName: PropTypes.string,
		postTitle: PropTypes.string,
		postUrl: PropTypes.string,
		repliedToComment: PropTypes.bool,
		siteId: PropTypes.number,
	};

	static defaultProps = {
		isBulkEdit: false,
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
			isBulkEdit,
			postAuthorDisplayName,
			postTitle,
			postUrl,
			repliedToComment,
			siteId,
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
			'is-bulk-edit': isBulkEdit,
			'is-expanded': isExpanded,
			'is-liked': isLiked,
			'is-spam': isSpam,
			'is-trash': isTrash,
		} );

		return (
			<Card className={ classes }>
				<CommentDetailHeader
					authorAvatarUrl={ authorAvatarUrl }
					authorDisplayName={ authorDisplayName }
					authorUrl={ authorUrl }
					commentContent={ commentContent }
					commentIsApproved={ isApproved }
					commentIsLiked={ isLiked }
					commentIsSpam={ isSpam }
					commentIsTrash={ isTrash }
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

const mapStateToProps = ( state, ownProps ) => {
	return {
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
		commentId: ownProps.commentId,
		commentIsApproved: 'approved' === ownProps.status,
		commentIsLiked: ownProps.i_like,
		commentIsSpam: 'spam' === ownProps.status,
		commentIsTrash: 'trash' === ownProps.status,
		postAuthorDisplayName: get( ownProps, 'post.author.name' ),
		postTitle: get( ownProps, 'post.title' ),
		postUrl: get( ownProps, 'post.link' ),
		repliedToComment: ownProps.replied, // TODO: not available in the current data structure
		siteId: ownProps.siteId,
	};
};

export default connect( mapStateToProps )( CommentDetail );
