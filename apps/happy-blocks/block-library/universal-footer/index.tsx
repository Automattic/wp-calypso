import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';

function registerBlocks() {
	registerBlockType( 'happy-blocks/universal-footer', {
		title: 'Universal Footer Navigation',
		icon: 'editor-kitchensink',
		category: 'embed',
		description: 'WordPress.com Footer Template Part',
		attributes: {},
		edit: Edit,
		save,
	} );
}

registerBlocks();
