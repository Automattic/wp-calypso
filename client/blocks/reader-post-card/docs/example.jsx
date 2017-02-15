/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderPostCardBlock from 'blocks/reader-post-card';
import { posts } from './fixtures';

const ReaderPostCard = () => (
	<div className="design-assets__group">
		<div>
			{ posts.map( item => (
				<ReaderPostCardBlock
					key={ item.post.global_ID }
					post={ item.post }
					site={ item.site }
				/>
			) ) }
		</div>
	</div>
);

ReaderPostCard.displayName = 'ReaderPostCard';

export default ReaderPostCard;
