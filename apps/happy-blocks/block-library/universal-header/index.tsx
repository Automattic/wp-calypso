import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';

function registerBlocks() {
	registerBlockType( 'happy-blocks/universal-header', {
		title: 'Universal Header Navigation',
		icon: 'editor-kitchensink',
		category: 'embed',
		description: 'WordPress.com Header Template Part',
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
