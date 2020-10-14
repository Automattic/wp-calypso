/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { ReaderCombinedCard, combinedCardPostKeyToKeys } from 'calypso/blocks/reader-combined-card';
import { posts, feed, site } from 'calypso/blocks/reader-post-card/docs/fixtures';

const postKey = {
	blogId: site.ID,
	postIds: posts.map( ( { global_ID } ) => global_ID ),
};

const ReaderCombinedCardExample = () => (
	<div className="design-assets__group">
		<div>
			<ReaderCombinedCard
				postKey={ postKey }
				postKeys={ combinedCardPostKeyToKeys( postKey ) }
				posts={ posts }
				feed={ feed }
				site={ site }
			/>
		</div>
	</div>
);

ReaderCombinedCardExample.displayName = 'ReaderCombinedCard';

export default ReaderCombinedCardExample;
