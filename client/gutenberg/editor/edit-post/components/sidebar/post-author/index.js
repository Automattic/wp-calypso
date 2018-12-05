/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { PanelRow } from '@wordpress/components';
import { PostAuthor as PostAuthorForm, PostAuthorCheck } from '@wordpress/editor';

export function PostAuthor() {
	return (
		<PostAuthorCheck>
			<PanelRow>
				<PostAuthorForm />
			</PanelRow>
		</PostAuthorCheck>
	);
}

export default PostAuthor;
