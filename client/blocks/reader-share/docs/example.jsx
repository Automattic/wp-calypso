/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import ReaderShare from 'calypso/blocks/reader-share';
import { posts } from 'calypso/blocks/reader-post-card/docs/fixtures';

const ReaderShareExample = () => (
	<div style={ { width: '100px' } }>
		<ReaderShare post={ posts[ 0 ] } />
	</div>
);

ReaderShareExample.displayName = 'ReaderShare';

export default ReaderShareExample;
