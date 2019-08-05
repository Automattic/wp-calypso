/* global fullSiteEditing */
/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';

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

const addFSETemplateClassname = createHigherOrderComponent( BlockListBlock => {
	return props => {
		if ( props.name !== 'a8c/template' ) {
			return <BlockListBlock { ...props } />;
		}

		return <BlockListBlock { ...props } className="template__block-container" />;
	};
}, 'addFSETemplateClassname' );

addFilter( 'editor.BlockListBlock', 'full-site-editing/blocks/template', addFSETemplateClassname );
