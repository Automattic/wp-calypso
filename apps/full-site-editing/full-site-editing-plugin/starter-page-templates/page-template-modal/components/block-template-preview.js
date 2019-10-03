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
import { Disabled } from '@wordpress/components';
/* eslint-enable import/no-extraneous-dependencies */

const BlockTemplatePreview = ( { blocks = [], viewportWidth } ) => {
	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<div className="template-selector-item__preview-wrap">
			<Disabled>
				<div className="editor-styles-wrapper">
					<div className="edit-post-visual-editor">
						<div className="editor-writing-flow">
							<BlockPreview
								blocks={ blocks }
								viewportWidth={ viewportWidth }
								__experimentalScalingDelay={ 0 }
							/>
						</div>
					</div>
				</div>
			</Disabled>
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default BlockTemplatePreview;
