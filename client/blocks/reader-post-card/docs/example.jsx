/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderPostCardBlock from 'blocks/reader-post-card';
import { posts, site } from './fixtures';

const ReaderPostCard = () =>
	<div className="design-assets__group">
		<div>
			{ posts.map( item =>
				<ReaderPostCardBlock key={ item.global_ID } post={ item } site={ site } />,
			) }
			<ReaderPostCardBlock compact key={ posts[ 0 ].global_ID } post={ posts[ 0 ] } site={ site } />
		</div>
	</div>;

ReaderPostCard.displayName = 'ReaderPostCard';

export default ReaderPostCard;
