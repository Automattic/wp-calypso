/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { __ } from '@wordpress/i18n';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import { BlockFramePreview } from './block-iframe-preview';

const TemplateSelectorPreview = ( { blocks = [], viewportWidth, blocksByTemplateSlug = {}, slug } ) => {
	const noBlocks = ! blocks.length;
	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<div className={ `template-selector-preview ${ noBlocks ? 'not-selected' : '' }` }>
			{ noBlocks && (
				<div className="editor-styles-wrapper">
					<div className="template-selector-preview__empty-state">
						{ __( 'Select a layout to preview.', 'full-site-editing' ) }
					</div>
				</div>
			) }

			<BlockFramePreview
				viewportWidth={ viewportWidth }
				blocksByTemplateSlug={ blocksByTemplateSlug }
				slug={ slug }
			/>
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default TemplateSelectorPreview;
