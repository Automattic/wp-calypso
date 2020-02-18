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
// import '@wordpress/block-library/build-style/style-rtl.css';
import '@wordpress/block-library/build-style/theme.css';
// import '@wordpress/block-library/build-style/theme-rtl.css';
import '@wordpress/block-library/build-style/editor.css';
import './exford-style.css';
import './exford-style-editor.css';

/* eslint-disable import/no-extraneous-dependencies */
// import { BlockPreview } from '@wordpress/block-editor';
/* eslint-enable import/no-extraneous-dependencies */

const BlockTemplatePreview = ( { design, onClick } ) => {
	const blocks = parseBlocks( design?.content );

	if ( ! blocks || ! blocks.length ) {
		return null;
	}

	return (
		<div
			onClick={ onClick }
			style={ {
				width: '1000px',
				height: '1000px',
				overflowY: 'scroll',
				backgroundColor: 'white',
				border: '1px solid black',
				cursor: 'pointer',
			} }
		>
			<BlockPreview blocks={ blocks } viewportWidth={ 1280 } />
		</div>
	);
};

export default BlockTemplatePreview;
