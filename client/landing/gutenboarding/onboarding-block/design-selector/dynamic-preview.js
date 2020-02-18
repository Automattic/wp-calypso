/**
 * External dependencies
 */
import React from 'react';
/**
 * Internal dependencies
 */

/**
 * WordPress dependencies
 */
import { BlockPreview } from '@wordpress/block-editor';
import { parse as parseBlocks } from '@wordpress/blocks';
import '@wordpress/block-library/build-style/style.css';
import '@wordpress/block-library/build-style/theme.css';
import '@wordpress/block-library/build-style/editor.css';

const BlockTemplatePreview = ( { design } ) => {
	const blocks = parseBlocks( design?.content );
	if ( ! blocks || ! blocks.length ) {
		return null;
	}

	return <BlockPreview blocks={ blocks } viewportWidth={ 1280 } />;
};

export default BlockTemplatePreview;
