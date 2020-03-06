/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { castArray } from 'lodash';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { withSelect } from '@wordpress/data';
import { compose, withSafeTimeout } from '@wordpress/compose';
import { useMemo } from '@wordpress/element';
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
import { Disabled } from '@wordpress/components';
/* eslint-enable import/no-extraneous-dependencies */

const LayoutPreview = ( { blocks = [], settings } ) => {
	const renderedBlocks = useMemo( () => castArray( blocks ), [ blocks ] );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="block-editor block-frame-preview__container editor-styles-wrapper">
			<div className="edit-post-visual-editor">
				<div className="editor-styles-wrapper">
					<div className="editor-writing-flow">
						<Disabled>
							<BlockEditorProvider value={ renderedBlocks } settings={ settings }>
								<BlockList />
							</BlockEditorProvider>
						</Disabled>
					</div>
				</div>
			</div>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default compose(
	withSafeTimeout,
	withSelect( select => {
		const blockEditorStore = select( 'core/block-editor' );
		return {
			settings: blockEditorStore ? blockEditorStore.getSettings() : {},
		};
	} )
)( LayoutPreview );
