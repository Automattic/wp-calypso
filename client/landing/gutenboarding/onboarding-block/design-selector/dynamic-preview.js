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

const BlockTemplatePreview = ( { blocks = [], onClick } ) => {
	if ( ! blocks || ! blocks.length ) {
		return null;
	}

	return (
		<div
            onClick={ onClick }
			style={ {
				width: '300px',
				height: '300px',
				overflowY: 'scroll',
                backgroundColor: 'white',
                cursor: 'pointer'
			} }
		>
			<BlockPreview blocks={ blocks } viewportWidth={ 1280 } />
		</div>
	);
};

export default BlockTemplatePreview;
