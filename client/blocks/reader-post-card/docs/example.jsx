/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { posts, site } from './fixtures';
import ReaderPostCardBlock from 'blocks/reader-post-card';

const ReaderPostCard = () =>
	<div className="design-assets__group">
		<div>
			{ posts.map( item =>
				<ReaderPostCardBlock key={ item.global_ID } post={ item } site={ site } />
			) }
		</div>
	</div>;

ReaderPostCard.displayName = 'ReaderPostCard';

export default ReaderPostCard;
