/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

export const CommentAuthorMeta = ( {
	author,
	translate,
} ) =>
	<div className="comment-detail__author-meta">
		<div>
			<Gridicon icon="link" size={ 18 } />
			{ author.URL }
		</div>
		<div>
			<Gridicon icon="mail" size={ 18 } />
			{ author.email }
		</div>
		<div>
			<Gridicon icon="globe" size={ 18 } />
			{ author.ip }
		</div>
		<div>
			<Gridicon icon="comment" size={ 18 } />
			{ translate(
				'%d Comment', '%d Comments',
				{ count: author.comments, args: author.comments }
			) }
		</div>
	</div>;

export default localize( CommentAuthorMeta );
