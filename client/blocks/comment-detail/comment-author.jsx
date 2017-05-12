/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ReaderAvatar from 'blocks/reader-avatar';

export const CommentAuthor = ( {
	author,
	className,
	date,
	post,
	siteIcon,
} ) =>
	<div className={ classNames( 'comment-detail__author', className ) }>
		<div className="comment-detail__author-avatar">
			{ post &&
				<ReaderAvatar
					author={ author }
					isCompact
					showPlaceholder
					siteIcon={ siteIcon }
				/>
			}
			{ ! post &&
				<img src={ author.avatar_URL } />
			}
		</div>
		<div className="comment-detail__author-content">
			<div className="comment-detail__author-name">
				{ author.name }
			</div>
			<div className="comment-detail__comment-date">
				<Gridicon icon="time" size={ 18 } />
				{ date }
			</div>
			{ post && post.title &&
				<div className="comment-detail__post-title">
					<a href={ post.url }>
						{ post.title }
					</a>
				</div>
			}
		</div>
	</div>;

export default CommentAuthor;
