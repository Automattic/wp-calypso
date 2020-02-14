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

const BlockTemplatePreview = ( { blocks = [] } ) => {
	if ( ! blocks || ! blocks.length ) {
		return null;
	}

	return (
		<div
			style={ {
				width: '300px',
				height: '300px',
				overflowY: 'scroll',
				backgroundColor: 'white',
				cursor: 'pointer',
			} }
		>
			<BlockPreview blocks={ blocks } viewportWidth={ 1280 } />
		</div>
	);
};

export default BlockTemplatePreview;
