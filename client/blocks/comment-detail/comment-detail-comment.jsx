/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

export const CommentDetailComment = ( {
	comment,
	moment,
	translate,
} ) =>
	<div className="comment-detail__comment">
		<div className="comment-detail__comment-content">
			<div className="comment-detail__author">
				<div className="comment-detail__author-avatar">
					<img src={ comment.author.avatar_URL } />
				</div>
				<div className="comment-detail__author-info">
					<div className="comment-detail__author-name">
						<strong>
							{ comment.author.name }
						</strong>
						<span>
							{ comment.author.URL }
						</span>
					</div>
					<div className="comment-detail__comment-date">
						{ moment( comment.date ).format( 'MMMM D, YYYY H:mma' ) }
					</div>
				</div>
			</div>

			<div className="comment-detail__comment-body">
				{ comment.body }
			</div>

			<div className="comment-detail__comment-reply">
				<a>
					<Gridicon icon="reply" />
					<span>{ translate( 'You replied to this comment' ) }</span>
				</a>
			</div>
		</div>
	</div>;

export default localize( CommentDetailComment );
