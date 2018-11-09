/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PostLastRevision from 'gutenberg/editor/components/post-last-revision';

/**
 * WordPress dependencies
 */
import { PanelBody } from '@wordpress/components';
import { PostLastRevisionCheck } from '@wordpress/editor';

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
