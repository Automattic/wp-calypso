/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { __ } from '@wordpress/i18n';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import BlockFramePreview from './block-frame-preview';

const TemplateSelectorPreview = ( { template, viewportWidth, slug, title } ) => {
	const isBlankTemplate = slug === 'blank';
	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<div className={ `template-selector-preview ${ isBlankTemplate ? 'not-selected' : '' }` }>
			{ isBlankTemplate && (
				<div className="editor-styles-wrapper">
					<div className="template-selector-preview__empty-state">
						{ __( 'Select a layout to preview.', 'full-site-editing' ) }
					</div>
				</div>
			) }

			<BlockFramePreview
				viewportWidth={ viewportWidth }
				template={ template }
				slug={ slug }
				title={ title }
			/>
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default TemplateSelectorPreview;
