/* global fullSiteEditing */
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

if ( 'wp_template' === fullSiteEditing.editorPostType ) {
	registerBlockType( 'a8c/site-title', {
		title: __( 'Site Title' ),
		description: __( 'Placeholder for your site title.' ),
		icon: 'layout',
		category: 'layout',
		supports: {
			html: false,
			multiple: false,
			reusable: false,
		},
		edit,
		save: () => null,
	} );
}
