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

registerBlockType( 'a8c/navigation-menu', {
	title: __( 'Navigation Menu' ),
	description: __( 'Visual placeholder for site-wide navigation and menus.' ),
	icon: 'layout',
	category: 'layout',
	supports: {
		html: false,
		multiple: false,
		reusable: false,
	},
	attributes: {
		themeLocation: {
			type: 'string',
			default: 'footer',
		},
	},
	edit,
	save: () => null,
} );
