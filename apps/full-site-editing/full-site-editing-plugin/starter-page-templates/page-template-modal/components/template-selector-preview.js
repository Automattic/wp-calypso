/**
 * External dependencies
 */
import classnames from 'classnames';
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { BlockPreview } from '@wordpress/block-editor';
import { Disabled } from '@wordpress/components';

/**
 * Internal dependencies
 */

import PreviewTemplateTitle from './preview-template-title';

const TemplateSelectorPreview = ( { blocks, viewportWidth, title } ) => {
	const previewElClasses = classnames( 'template-selector-preview', 'editor-styles-wrapper' );

	if ( isEmpty( blocks ) ) {
		return (
			<div className={ previewElClasses }>
				<div className="template-selector-preview__placeholder">
					{ __( 'Select a page template to preview.', 'full-site-editing' ) }
				</div>
			</div>
		);
	}

	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<div className={ previewElClasses }>
			<Disabled>
				<div className="edit-post-visual-editor">
					<div className="editor-styles-wrapper">
						<div className="editor-writing-flow">
							<PreviewTemplateTitle title={ title } />
							<BlockPreview blocks={ blocks } viewportWidth={ viewportWidth } />
						</div>
					</div>
				</div>
			</Disabled>
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default TemplateSelectorPreview;
