/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { PostItem } from 'blocks/post-item';

function PostTypeListPostPlaceholder( { translate } ) {
	const post = {
		title: translate( 'Loading…' ),
		status: 'draft',
		modified: '2015-08-10T19:44:08+00:00'
	};

	return (
		<PostItem
			post={ post }
			className="post-type-list__post-placeholder" />
	);
}

export default localize( PostTypeListPostPlaceholder );
