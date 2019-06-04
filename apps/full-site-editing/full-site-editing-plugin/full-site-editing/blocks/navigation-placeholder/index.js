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
		align: [ 'wide', 'full' ],
		anchor: true,
		html: false,
		multiple: false,
		reusable: false,
	},
	attributes: {
		theme_location: {
			type: 'string',
		},
		menu_class: {
			type: 'string',
		},
		items_wrap: {
			type: 'string',
		},
	},
	edit,
	save: () => null,
} );
