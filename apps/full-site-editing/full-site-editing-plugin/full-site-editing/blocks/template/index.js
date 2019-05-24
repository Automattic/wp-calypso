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
	registerBlockType( 'a8c/template', {
		title: __( 'Template Part' ),
		description: __( 'Display a template part.' ),
		icon: 'layout',
		category: 'layout',
		attributes: { templateId: { type: 'number' } },
		supports: {
			align: [ 'wide', 'full' ],
			anchor: true,
			html: false,
			reusable: false,
		},
		edit,
		save: () => null,
	} );
}
