/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import BlockLayoutPreview from './block-layout-preview';

const TemplateSelectorPreview = ( { blocks = [], viewportWidth, title } ) => {
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

			{ ! noBlocks && (
				<BlockLayoutPreview blocks={ blocks } viewportWidth={ viewportWidth } title={ title } />
			) }
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default TemplateSelectorPreview;
