/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderShare from 'blocks/reader-share';
import Card from 'components/card';
import { posts } from 'blocks/reader-post-card/docs/fixtures';

const ReaderShareExample = () => (
	<div className="design-assets__group">
		<ReaderShare post={ posts[0] } />
	</div>
);

ReaderShareExample.displayName = 'ReaderShare';

export default ReaderShareExample;
