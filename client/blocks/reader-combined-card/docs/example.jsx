/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderCombinedCardBlock from 'blocks/reader-combined-card';
import { posts, feed, site } from 'blocks/reader-post-card/docs/fixtures';

const postKey = { blogId: site.ID };

const ReaderCombinedCard = () => (
	<div className="design-assets__group">
		<div>
			<ReaderCombinedCardBlock postKey={ postKey } posts={ posts } feed={ feed } site={ site } />
		</div>
	</div>
);

ReaderCombinedCard.displayName = 'ReaderCombinedCard';

export default ReaderCombinedCard;
