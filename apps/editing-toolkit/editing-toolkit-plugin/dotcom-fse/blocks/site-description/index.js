/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';
import { getCategoryWithFallbacks } from '../../../block-helpers';
import './style.scss';

registerBlockType( 'a8c/site-description', {
	title: __( 'Site Description', 'full-site-editing' ),
	description: __( 'Site description, also known as the tagline.', 'full-site-editing' ),
	icon: (
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
			<path fill="none" d="M0 0h24v24H0z" />
			<path d="M4 9h16v2H4V9zm0 4h10v2H4v-2z" />
		</svg>
	),
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
		backgroundColor: {
			type: 'string',
		},
		customBackgroundColor: {
			type: 'string',
		},
		fontSize: {
			type: 'string',
			default: 'small',
		},
		customFontSize: {
			type: 'number',
		},
	},
	edit,
	save: () => null,
} );
