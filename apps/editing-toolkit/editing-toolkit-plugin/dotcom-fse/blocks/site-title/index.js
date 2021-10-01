import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { getCategoryWithFallbacks } from '../../../block-helpers';
import edit from './edit';

import './style.scss';

registerBlockType( 'a8c/site-title', {
	title: __( 'Site Title', 'full-site-editing' ),
	description: __( 'Your site title.', 'full-site-editing' ),
	icon: 'layout',
	category: getCategoryWithFallbacks( 'design', 'layout' ),
	supports: {
		align: [ 'wide', 'full' ],
		html: false,
		multiple: false,
		reusable: false,
	},
	attributes: {
		align: {
			type: 'string',
			default: 'wide',
		},
		textAlign: {
			type: 'string',
			default: 'center',
		},
		textColor: {
			type: 'string',
		},
		customTextColor: {
			type: 'string',
		},
		fontSize: {
			type: 'string',
			default: 'normal',
		},
		customFontSize: {
			type: 'number',
		},
	},
	edit,
	save: () => null,
} );
