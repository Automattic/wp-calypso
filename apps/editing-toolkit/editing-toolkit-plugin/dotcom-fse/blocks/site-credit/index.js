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

registerBlockType( 'a8c/site-credit', {
	title: __( 'WordPress.com Credit', 'full-site-editing' ),
	description: __(
		"This block tells the world that you're using WordPress.com.",
		'full-site-editing'
	),
	icon: 'wordpress-alt',
	category: getCategoryWithFallbacks( 'design', 'layout' ),
	supports: {
		align: [ 'wide', 'full' ],
		html: false,
		multiple: false,
		reusable: false,
		removal: false,
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
	},
	edit,
	save: () => null,
} );
