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
	icon: 'layout',
	category: 'layout',
	supports: {
		html: false,
		multiple: false,
		reusable: false,
	},
	attributes: {
		description: {
			default: __( 'Site description loading…' ),
			type: 'string',
		},
	},
	edit,
	save: () => null,
} );
