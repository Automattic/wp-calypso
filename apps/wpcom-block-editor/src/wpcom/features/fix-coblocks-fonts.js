import { removeFilter } from '@wordpress/hooks';
import { isEditorReadyWithBlocks } from '../../utils';

/**
 * Remove the CoBlocks font styles filter from the block save content.
 *
 * The CoBlocks font styles filter is causing invalid blocks to be saved.
 * Specifically, the filter is adding a style attribute to the block save
 * content which includes a rule for the font-family. As wpcom doesn't use
 * the CoBlocks typography controls, we can safely remove the filter.
 *
 * @see https://github.com/godaddy-wordpress/coblocks/issues/2475
 */
async function removeCoBlocksFontStyles() {
	const editorHasBlocks = await isEditorReadyWithBlocks();
	if ( ! editorHasBlocks ) {
		return;
	}

	removeFilter( 'blocks.getSaveContent.extraProps', 'coblocks/applyFontSettings' );
}

removeCoBlocksFontStyles();
