/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { PanelRow } from '@wordpress/components';
import { PostTrashCheck } from '@wordpress/editor';
import PostTrashLink from 'gutenberg/editor/components/post-trash-link'; // GUTENLYPSO

export default function PostTrash() {
	return (
		<PostTrashCheck>
			<PanelRow>
				<PostTrashLink />
			</PanelRow>
		</PostTrashCheck>
	);
}
