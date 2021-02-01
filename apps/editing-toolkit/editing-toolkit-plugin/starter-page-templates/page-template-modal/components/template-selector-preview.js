/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import BlockIframePreview from './block-iframe-preview';

const TemplateSelectorPreview = ( { theme, locale, postId } ) => {
	const noBlocks = ! postId;
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

			<BlockIframePreview theme={ theme } locale={ locale } postId={ postId } />
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default TemplateSelectorPreview;
