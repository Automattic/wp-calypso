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

	return (
		<div className="edit-post-visual-editor">
			<div className="editor-styles-wrapper">
				<BlockPreview blocks={ blocks } viewportWidth={ viewportWidth } />
			</div>
		</div>
	);
};

export default  BlockTemplatePreview;
