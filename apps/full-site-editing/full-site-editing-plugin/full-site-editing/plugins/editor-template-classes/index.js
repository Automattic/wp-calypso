/* global fullSiteEditing */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { endsWith, get, map } from 'lodash';

/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';

const EditorTemplateClasses = withSelect( select => {
	const { getEntityRecord } = select( 'core' );
	const { getEditedPostAttribute } = select( 'core/editor' );
	const templatePartClasses = map( getEditedPostAttribute( 'template_part_types' ), typeId => {
		const typeName = get(
			getEntityRecord( 'taxonomy', 'wp_template_part_type', typeId ),
			'name',
			''
		);
		if ( endsWith( typeName, '-header' ) ) {
			return 'site-header site-branding';
		}
		if ( endsWith( typeName, '-footer' ) ) {
			return 'site-footer';
		}
	} );
	return { templatePartClasses };
} )( ( { templatePartClasses } ) => {
	const blockListInception = setInterval( () => {
		const blockList = document.querySelector(
			'.editor-block-list__layout.block-editor-block-list__layout'
		);

		if ( ! blockList ) {
			return;
		}
		clearInterval( blockListInception );

		blockList.className = classNames(
			'editor-block-list__layout',
			'block-editor-block-list__layout',
			...templatePartClasses
		);
	} );

	return null;
} );

if ( 'wp_template_part' === fullSiteEditing.editorPostType ) {
	registerPlugin( 'fse-editor-template-classes', {
		render: EditorTemplateClasses,
	} );
}
