/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

/**
 * WordPress dependencies
 */
import { BlockPreview } from '@wordpress/block-editor';

const BlockTemplatePreview = ( { blocks, viewportWidth } ) => {
	if ( ! blocks ) {
		return null;
	}

	return <BlockPreview blocks={ blocks } viewportWidth={ viewportWidth } />;
};

export default  BlockTemplatePreview;
