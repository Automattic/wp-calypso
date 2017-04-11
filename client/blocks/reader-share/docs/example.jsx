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
	<div className="design-assets__group" style={ { width: '100px' } }>
		<ReaderShare post={ posts[0] } tagName="div" />
	</div>
);

ReaderShareExample.displayName = 'ReaderShare';

export default ReaderShareExample;
