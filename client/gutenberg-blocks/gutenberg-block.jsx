/** @format */

/**
 * External dependencies
 */
import { getBlockType, getSaveElement } from '@wordpress/blocks';

const GutenbergBlock = ( { name, attributes } ) =>
	getSaveElement( getBlockType( name ), attributes );

export default GutenbergBlock;
