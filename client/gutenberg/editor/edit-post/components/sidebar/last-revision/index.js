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
	return (
		<PostLastRevisionCheck>
			<PanelBody className="edit-post-last-revision__panel">
				<PostLastRevision />
			</PanelBody>
		</PostLastRevisionCheck>
	);
}

export default LastRevision;
