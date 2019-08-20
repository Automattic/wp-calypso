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

const icon = (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<path fill="none" d="M0 0h24v24H0V0z" />
		<path d="M12 7.27l4.28 10.43-3.47-1.53-.81-.36-.81.36-3.47 1.53L12 7.27M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
	</svg>
);

registerBlockType( 'a8c/navigation-menu', {
	title: __( 'Navigation Menu' ),
	description: __( 'Visual placeholder for site-wide navigation and menus.' ),
	icon,
	category: 'layout',
	supports: {
		html: false,
		reusable: false,
	},
	edit,
	save: () => null,
} );