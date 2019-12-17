/* eslint-disable import/no-extraneous-dependencies */

/**
 * External dependencies
 */
import { select, dispatch, subscribe } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';

const unsubscribe = subscribe( () => {
	const isCleanNewPost = select( 'core/editor' ).isCleanNewPost();

	if ( isCleanNewPost ) {
		unsubscribe();
	}

	const blocks = select( 'core/editor' ).getBlocks();

	if ( blocks.length === 0 ) {
		return;
	}

	unsubscribe();

	//If any blocks have validation issues auto-fix them for now, until core is less strict.
	select( 'core/editor' )
		.getBlocks()
		.filter( block => ! block.isValid )
		.forEach( ( { clientId, name, attributes, innerBlocks } ) => {
			dispatch( 'core/editor' ).replaceBlock(
				clientId,
				createBlock( name, attributes, innerBlocks )
			);
		} );
} );
