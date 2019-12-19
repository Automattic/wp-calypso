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

async function fixInvalidBlocks() {
	const editorHasBlocks = await isEditorReadyWithBlocks();
	if ( ! editorHasBlocks ) {
		return;
	}

	// If any blocks have validation issues auto-fix them for now, until core is less strict.
	select( 'core/editor' )
		.getBlocks()
		.filter( block => ! block.isValid )
		.forEach( ( { clientId, name, attributes, innerBlocks } ) => {
			dispatch( 'core/editor' ).replaceBlock(
				clientId,
				createBlock( name, attributes, innerBlocks )
			);
		} );
}

fixInvalidBlocks();
