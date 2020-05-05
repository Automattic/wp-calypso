/* eslint-disable import/no-extraneous-dependencies */

/**
 * External dependencies
 */
import { select, dispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { isEditorReadyWithBlocks } from '../../utils';

/**
 * Checks if a given block object has content.
 *
 * Makes sure that we don't delete content when block auto-fix gives us empty
 * block content. For example, if a paragraph block structure is invalid, its
 * content attribute may be an empty string. However, depending on the error,
 * the block could still be fixed via the code editor. This way, we keep blocks
 * which do not auto-fix into a somewhat reasonable shape so that they can be
 * manually fixed.
 *
 * Note that we return 'true' if we don't understand how to validate the block.
 * This way, we continue auto-fixing other blocks if we can.
 *
 * @param {object} block The block to check for content.
 * @returns bool True if the block has content. False otherwise.
 */
function blockHasContent( block ) {
	// There is no content if there is no block.
	if ( ! block ) {
		return false;
	}
	switch ( block.name ) {
		case 'core/paragraph':
			return block.attributes?.content?.length > 0;
		case 'core/image':
			return block.attributes?.url?.length > 0;
		case 'core/quote':
			return block.attributes?.value?.length > 0;
		default:
			return true;
	}
}

async function fixInvalidBlocks() {
	const editorHasBlocks = await isEditorReadyWithBlocks();
	if ( ! editorHasBlocks ) {
		return;
	}

	// If any blocks have validation issues auto-fix them for now, until core is less strict.
	select( 'core/editor' )
		.getBlocks()
		.filter( ( block ) => ! block.isValid )
		.forEach( ( { clientId, name, attributes, innerBlocks } ) => {
			const replacement = createBlock( name, attributes, innerBlocks );
			if ( blockHasContent( replacement ) ) {
				dispatch( 'core/editor' ).replaceBlock( clientId, replacement );
			}
		} );
}

fixInvalidBlocks();
