/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import BlockIframePreview from './block-iframe-preview';
import type { BlockEditorProvider } from '@wordpress/block-editor';

interface TemplateSelectorPreviewProps {
	blocks: BlockEditorProvider.Props[ 'value' ];
	viewportWidth: number;
	title: string;
}

const TemplateSelectorPreview: React.FC< TemplateSelectorPreviewProps > = ( {
	blocks = [],
	viewportWidth,
	title,
} ) => {
	const noBlocks = ! blocks.length;
	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<div className={ `template-selector-preview ${ noBlocks ? 'not-selected' : '' }` }>
			{ noBlocks && (
				<div className="editor-styles-wrapper">
					<div className="template-selector-preview__empty-state">
						{ __( 'Select a layout to preview.', __i18n_text_domain__ ) }
					</div>
				</div>
			) }

			{ /* Always render preview iframe to ensure it's ready to populate with Blocks. */
			/* Without this some browsers will experience a noticavle delay
			/* before Blocks are populated into the iframe. */ }
			<BlockIframePreview blocks={ blocks } viewportWidth={ viewportWidth } title={ title } />
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default TemplateSelectorPreview;
