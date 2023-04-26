import { registerBlockType } from '@wordpress/blocks';
import { getLocaleData } from '@wordpress/i18n';
import Edit from './edit';
import save from './save';

function registerBlocks() {
	registerBlockType( 'happy-blocks/universal-footer', {
		title: 'Universal Footer Navigation',
		icon: 'editor-kitchensink',
		category: 'embed',
		description: 'WordPress.com Footer Template Part',
		attributes: {
			locale: {
				type: 'string',
				default: getLocaleData( 'happy-blocks' )?.[ '' ]?.language,
			},
		},
		edit: Edit,
		save,
	} );
}

registerBlocks();
