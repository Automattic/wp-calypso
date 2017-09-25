/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import CommentDetailAuthor from './comment-detail-author';
import AutoDirection from 'components/auto-direction';
import Emojify from 'components/emojify';

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
		commentId: PropTypes.number,
		commentStatus: PropTypes.string,
		commentType: PropTypes.string,
		commentUrl: PropTypes.string,
		siteBlacklist: PropTypes.string,
		siteId: PropTypes.number,
	};

	render() {
		const {
			authorAvatarUrl,
			authorDisplayName,
			authorEmail,
			authorId,
			authorIp,
			authorIsBlocked,
			authorUrl,
			authorUsername,
			commentContent,
			commentDate,
			commentId,
			commentStatus,
			commentType,
			commentUrl,
			repliedToComment,
			siteBlacklist,
			siteId,
			translate,
		} = this.props;

		return (
			<div className="comment-detail__comment">
				<div className="comment-detail__comment-content">
					<CommentDetailAuthor
						authorAvatarUrl={ authorAvatarUrl }
						authorDisplayName={ authorDisplayName }
						authorEmail={ authorEmail }
						authorId={ authorId }
						authorIp={ authorIp }
						authorIsBlocked={ authorIsBlocked }
						authorUrl={ authorUrl }
						authorUsername={ authorUsername }
						commentDate={ commentDate }
						commentId={ commentId }
						commentStatus={ commentStatus }
						commentType={ commentType }
						commentUrl={ commentUrl }
						siteBlacklist={ siteBlacklist }
						siteId={ siteId }
					/>
					<AutoDirection>
						<Emojify>
							<div className="comment-detail__comment-body"
								dangerouslySetInnerHTML={ { __html: commentContent } } //eslint-disable-line react/no-danger
							/>
						</Emojify>
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
