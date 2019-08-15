/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import BlockPreview from './block-template-preview';

const TemplateSelectorPreview = ( { blocks, viewportWidth } ) => {
	return (
		<div className="template-selector-preview">
			{ isEmpty( blocks ) ? (
				<div className="template-selector-preview__placeholder">
					{ __( 'Select a page template to preview.', 'full-site-editing' ) }
				</div>
			) : (
				<BlockPreview blocks={ blocks } viewportWidth={ viewportWidth } />
			) }
		</div>
	);
};

export default TemplateSelectorPreview;
