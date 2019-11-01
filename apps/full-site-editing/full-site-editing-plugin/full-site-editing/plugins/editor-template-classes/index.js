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
	const templateClasses = map( getEditedPostAttribute( 'template_part_types' ), typeId => {
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
	return { templateClasses };
} )( ( { templateClasses } ) => {
	const blockListInception = setInterval( () => {
		const blockList = document.querySelector(
			'.block-editor-writing-flow.editor-writing-flow > div'
		);

		if ( ! blockList ) {
			return;
		}
		clearInterval( blockListInception );

		blockList.className = classNames( 'a8c-template-editor', ...templateClasses );
	} );

	return null;
} );

if ( 'wp_template_part' === fullSiteEditing.editorPostType ) {
	registerPlugin( 'fse-editor-template-classes', {
		render: EditorTemplateClasses,
	} );
}
