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

if ( 'wp_template_part' !== fullSiteEditing.editorPostType ) {
	registerBlockType( 'a8c/template', {
		title: __( 'Template Part' ),
		description: __( 'Display a template part.' ),
		icon: 'layout',
		category: 'layout',
		attributes: { templateId: { type: 'number' } },
		supports: {
			anchor: true,
			html: false,
			reusable: false,
		},
		edit,
		save: () => null,
		getEditWrapperProps() {
			return { 'data-align': 'full' };
		},
	} );
}
