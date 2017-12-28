/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import ReaderShare from 'client/blocks/reader-share';
import Card from 'client/components/card';
import { posts } from 'client/blocks/reader-post-card/docs/fixtures';

const ReaderShareExample = () => (
	<div className="design-assets__group" style={ { width: '100px' } }>
		<ReaderShare post={ posts[ 0 ] } tagName="div" />
	</div>
);

ReaderShareExample.displayName = 'ReaderShare';

export default ReaderShareExample;
