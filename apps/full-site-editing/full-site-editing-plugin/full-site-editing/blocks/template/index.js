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

if ( 'wp_template' !== fullSiteEditing.editorPostType ) {
	registerBlockType( 'a8c/template', {
		title: __( 'Template' ),
		description: __( 'Display a template.' ),
		icon: 'layout',
		category: 'layout',
		attributes: { templateId: { type: 'number' } },
		supports: {
			anchor: false,
			customClassName: true, // Needed to support the classname we inject
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
