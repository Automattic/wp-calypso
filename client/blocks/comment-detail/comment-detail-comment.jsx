/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

export const CommentDetailComment = ( {
	comment,
	moment,
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
		</div>
	</div>;

export default localize( CommentDetailComment );
