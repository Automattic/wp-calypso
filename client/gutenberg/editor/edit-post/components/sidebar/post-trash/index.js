/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { PanelRow } from '@wordpress/components';
import { PostTrash as PostTrashLink, PostTrashCheck } from '@wordpress/editor';

export default function PostTrash() {
	return (
		<PostTrashCheck>
			<PanelRow>
				<PostTrashLink />
			</PanelRow>
		</PostTrashCheck>
	);
}
