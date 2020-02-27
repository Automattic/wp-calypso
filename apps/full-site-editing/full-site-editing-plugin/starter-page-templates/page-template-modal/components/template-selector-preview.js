/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { __ } from '@wordpress/i18n';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import BlockFramePreview from './block-iframe-preview';

const TemplateSelectorPreview = ( { blocks = [], viewportWidth } ) => {
	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<div className="template-selector-preview">
			{ ! blocks.length && (
				<div class="template-selector-preview__empty-state editor-styles-wrapper">
					{ __( 'Select a layout to preview.', 'full-site-editing' ) }
				</div>
			) }
			<BlockFramePreview blocks={ blocks } viewportWidth={ viewportWidth } />
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default TemplateSelectorPreview;
