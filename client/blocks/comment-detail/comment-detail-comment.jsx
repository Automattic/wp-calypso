/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CommentDetailAuthor from './comment-detail-author';

export class CommentDetailComment extends Component {
	static propTypes = {
		authorAvatarUrl: PropTypes.string,
		authorDisplayName: PropTypes.string,
		authorEmail: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.string ] ),
		authorId: PropTypes.number,
		authorIp: PropTypes.string,
		authorIsBlocked: PropTypes.bool,
		authorUrl: PropTypes.string,
		authorUsername: PropTypes.string,
		blockUser: PropTypes.func,
		commentContent: PropTypes.string,
		commentDate: PropTypes.string,
	};

	render() {
		const {
			authorAvatarUrl,
			authorDisplayName,
			authorEmail,
			authorIp,
			authorIsBlocked,
			authorUrl,
			authorUsername,
			blockUser,
			commentContent,
			commentDate,
			repliedToComment,
			translate,
		} = this.props;

		return (
			<div className="comment-detail__comment">
				<div className="comment-detail__comment-content">
					<CommentDetailAuthor
						authorAvatarUrl={ authorAvatarUrl }
						authorDisplayName={ authorDisplayName }
						authorEmail={ authorEmail }
						authorIp={ authorIp }
						authorIsBlocked={ authorIsBlocked }
						authorUrl={ authorUrl }
						authorUsername={ authorUsername }
						blockUser={ blockUser }
						commentDate={ commentDate }
					/>

					<div className="comment-detail__comment-body">
						{ commentContent }
					</div>

					{ repliedToComment &&
						<div className="comment-detail__comment-reply">
							<a>
								<Gridicon icon="reply" />
								<span>{ translate( 'You replied to this comment' ) }</span>
							</a>
						</div>
					}
				</div>
			</div>
		);
	}
}

export default localize( CommentDetailComment );
