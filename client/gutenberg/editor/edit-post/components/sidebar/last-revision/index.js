/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { PanelBody } from '@wordpress/components';
import { PostLastRevision, PostLastRevisionCheck } from '@wordpress/editor';

function LastRevision() {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<PostLastRevisionCheck>
			<PanelBody className="edit-post-last-revision__panel">
				<PostLastRevision />
			</PanelBody>
		</PostLastRevisionCheck>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default LastRevision;
