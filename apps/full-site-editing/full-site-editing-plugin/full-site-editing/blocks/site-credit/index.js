/* eslint-disable import/no-extraneous-dependencies */
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

registerBlockType( 'a8c/site-credit', {
	title: __( 'WordPress.com Credit' ),
	description: __( "This block tells the wolrd that you're using WordPress.com." ),
	icon: 'wordpress-alt',
	category: 'layout',
	supports: {
		html: false,
		multiple: false,
		reusable: false,
	},
	edit,
	save: () => null,
} );
