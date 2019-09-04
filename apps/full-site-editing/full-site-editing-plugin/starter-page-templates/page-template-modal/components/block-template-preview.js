/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { BlockPreview } from '@wordpress/block-editor';
/* eslint-enable import/no-extraneous-dependencies */

const BlockTemplatePreview = ( { blocks = [], viewportWidth } ) => {
	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<div className="edit-post-visual-editor">
			<div className="editor-styles-wrapper">
				<div className="editor-writing-flow">
					<div className="template-selector-item__preview-wrap">
						<BlockPreview
							blocks={ blocks }
							viewportWidth={ viewportWidth }
							__experimentalScalingDelay={ 0 }
						/>
					</div>
				</div>
			</div>
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default BlockTemplatePreview;
