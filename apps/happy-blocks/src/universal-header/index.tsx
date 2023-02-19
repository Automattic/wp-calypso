import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';

function registerBlocks() {
	registerBlockType( 'happy-blocks/universal-header', {
		title: 'Universal Header Navigation',
		icon: 'editor-kitchensink',
		category: 'embed',
		description: 'Pricing Plan upgrade block',
		attributes: {},
		edit: Edit,
	} );
}

registerBlocks();
