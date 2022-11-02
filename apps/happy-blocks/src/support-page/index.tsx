import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { Edit } from './edit';
import { WordPressIcon } from './icon';
import { Save } from './save';

registerBlockType( 'happy-blocks/support-page', {
	title: __( 'WordPress Guide', 'happy-blocks' ),
	icon: WordPressIcon,
	category: 'embed',
	description: __( 'Embed a page from the WordPress Guide', 'happy-blocks' ),
	keywords: [ __( 'guide' ), __( 'support' ), __( 'how to' ), __( 'howto' ) ],
	attributes: {
		url: {
			type: 'string',
			default: '',
		},
		content: {
			type: 'string',
			default: '',
			// TODO store in HTML instead of attributes
		},
	},
	supports: {
		align: true,
		anchor: true,
	},
	edit: Edit,
	save: Save,
} );
