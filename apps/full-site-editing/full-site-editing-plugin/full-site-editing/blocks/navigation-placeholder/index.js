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

registerBlockType( 'a8c/navigation-placeholder', {
	title: __( 'Navigation Placeholder' ),
	description: __( 'Placeholder for site-wide navigation and menus.' ),
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
			default: 'main-1',
		},
	},
	edit,
	save: () => null,
} );
