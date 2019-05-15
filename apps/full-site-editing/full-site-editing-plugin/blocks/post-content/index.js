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
	registerBlockType( 'a8c/post-content', {
		title: __( 'Content Slot' ),
		description: __( 'Placeholder for a post or a page.' ),
		icon: 'layout',
		category: 'layout',
		supports: {
			align: [ 'wide', 'full' ],
			anchor: true,
			html: false,
			multiple: false,
			reusable: false,
		},
		edit,
		save: () => null,
	} );
}
