/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';
import './style.scss';

registerBlockType( 'a8c/site-description', {
	title: __( 'Site Description' ),
	description: __( 'Site description, also known as the tagline.' ),
	icon: (
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
			<path fill="none" d="M0 0h24v24H0z" />
			<path d="M4 9h16v2H4V9zm0 4h10v2H4v-2z" />
		</svg>
	),
	category: 'layout',
	supports: {
		html: false,
		multiple: false,
		reusable: false,
	},
	edit,
	save: () => null,
} );
