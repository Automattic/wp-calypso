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
import './site-logo';

if ( 'wp_template' !== fullSiteEditing.editorPostType ) {
	registerBlockType( 'a8c/template', {
		title: __( 'Template' ),
		description: __( 'Display a template.' ),
		icon: 'layout',
		category: 'layout',
		attributes: {
			templateId: { type: 'number' },
			className: { type: 'string' },
		},
		supports: {
			anchor: false,
			customClassName: false,
			html: false,
			inserter: false,
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

// Must be 9 or this breaks on Simple Sites
addFilter(
	'editor.BlockListBlock',
	'full-site-editing/blocks/template',
	addFSETemplateClassname,
	9
);
