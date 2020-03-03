/**
 * Internal dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { name, settings } from '.';
import { registerQueryStore } from './store';

registerBlockType( `newspack-blocks/${ name }`, settings );
registerQueryStore();
