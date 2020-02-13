/**
 * External dependencies
 */
import React from 'react';
import { BlockPreview } from '@wordpress/block-editor';
/**
 * Internal dependencies
 */

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
// import { BlockPreview } from '@wordpress/block-editor';
/* eslint-enable import/no-extraneous-dependencies */

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
			} }
		>
			<BlockPreview blocks={ blocks } viewportWidth={ 1280 } />
		</div>
	);
};

export default BlockTemplatePreview;
