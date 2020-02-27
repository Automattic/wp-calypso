/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { __ } from '@wordpress/i18n';
import { createBlock } from '@wordpress/blocks';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import BlockFramePreview from './block-iframe-preview';

const TemplateSelectorPreview = ( { blocks = [], viewportWidth, title } ) => {
	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<div className={ `template-selector-preview ${ ! blocks.length ? 'not-selected' : '' }` }>
			{ ! blocks.length && (
				<div class="template-selector-preview__empty-state">
					{ __( 'Select a layout to preview.', 'full-site-editing' ) }
				</div>
			) }
			<BlockFramePreview
				blocks={
					! blocks.length
						? []
						: [
								createBlock( 'core/heading', {
									content: title,
									align: 'center',
									level: 1,
								} ),
								...blocks,
						  ]
				}
				viewportWidth={ viewportWidth }
			/>
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default TemplateSelectorPreview;
