/**
 * Internal dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { name, settings } from '.';

registerBlockType( `newspack-blocks/${ name }`, settings );
