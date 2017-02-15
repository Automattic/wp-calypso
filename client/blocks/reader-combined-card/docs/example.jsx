/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderCombinedCardBlock from 'blocks/reader-combined-card';
import { posts } from 'blocks/reader-post-card/docs/fixtures';

const ReaderCombinedCard = () => (
	<div className="design-assets__group">
		<div>
			<ReaderCombinedCardBlock posts={ posts } />
		</div>
	</div>
);

export default ReaderCombinedCard;
