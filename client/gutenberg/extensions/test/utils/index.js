/**
 * External dependencies
 */
import { createBlock, getBlockType, getSaveContent, registerBlockType } from '@wordpress/blocks';

export function blockSave( name, settings, attributes ) {
	if ( ! getBlockType( name ) ) {
		registerBlockType( name, settings );
	}
	const block = createBlock( name, attributes );

	return getSaveContent( block );
}
