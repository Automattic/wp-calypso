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
import AutoDirection from 'components/auto-direction';

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
		commentStatus: PropTypes.string,
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
			commentStatus,
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
						commentStatus={ commentStatus }
					/>
					<AutoDirection>
						<div className="comment-detail__comment-body"
							dangerouslySetInnerHTML={ { __html: commentContent } } //eslint-disable-line react/no-danger
						/>
					</AutoDirection>

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
