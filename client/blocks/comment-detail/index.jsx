/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CommentActions from './comment-actions';
import CommentAuthor from './comment-author';
import CommentAuthorMeta from './comment-author-meta';

export const CommentDetail = ( {
	author,
	className,
	comment,
	post,
	site,
	user,
} ) =>
	<Card className={ classNames( 'comment-detail', className ) }>
		<div className="comment-detail__post">
			<CommentAuthor
				author={ author }
				date={ post.date }
				post={ post }
				siteIcon={ site.icon }
			/>
		</div>

		<div className="comment-detail__comment">
			<div className="comment-detail__comment-content">
				<CommentAuthor
					author={ author }
					date={ comment.date }
				/>
				<div className="comment-detail__comment-body">
					{ comment.body }
				</div>
			</div>
		</div>

		<CommentAuthorMeta author={ author } />

		<CommentActions />

		<div className="comment-detail__reply">
			<img src={ user.avatar_URL } />
			<textarea name="comment-reply"></textarea>
		</div>
	</Card>;

export default CommentDetail;
