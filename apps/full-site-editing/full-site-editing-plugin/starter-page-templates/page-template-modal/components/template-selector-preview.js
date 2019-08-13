/**
 * External dependencies
 */
import { BlockPreview } from '@wordpress/block-editor';

const TemplateSelectorPreview = ( { blocks, viewportWidth } ) => {
	return (
		<div className="template-selector-preview">
			<BlockPreview blocks={ blocks } viewportWidth={ viewportWidth } />
		</div>
	);
};

export default TemplateSelectorPreview;
