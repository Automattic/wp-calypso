/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import ReaderShare from 'calypso/blocks/reader-share';
import { Card } from '@automattic/components';
import { posts } from 'calypso/blocks/reader-post-card/docs/fixtures';

const ReaderShareExample = () => (
	<div className="design-assets__group" style={ { width: '100px' } }>
		<ReaderShare post={ posts[ 0 ] } tagName="div" />
	</div>
);

ReaderShareExample.displayName = 'ReaderShare';

export default ReaderShareExample;
