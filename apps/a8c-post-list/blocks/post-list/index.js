/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';

registerBlockType( 'a8c/post-list', {
	title: __( 'Post List (Blog)' ),
	description: __( 'Placeholder for a blog.' ),
	icon: 'layout',
	category: 'layout',
	supports: {
		align: [ 'wide', 'full' ],
		anchor: true,
		html: false,
		multiple: false,
		reusable: false,
	},
	edit: () => <span>Blog here!</span>,
	save: () => null,
} );
