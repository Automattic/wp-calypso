import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';

function registerBlocks() {
	registerBlockType( 'happy-blocks/universal-footer', {
		title: 'Universal Footer Navigation',
		icon: 'editor-kitchensink',
		category: 'embed',
		description: 'WordPress.com Footer Template Part',
		attributes: {
			isLoggedIn: {
				type: 'boolean',
			},
			logoColor: {
				type: 'string',
				default: '#0675c4',
			},
			sectionName: {
				type: 'string',
			},
		},
		edit: Edit,
	} );
}

registerBlocks();
