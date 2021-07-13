/* global fullSiteEditing */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { get, map } from 'lodash';

/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';

const EditorTemplateClasses = withSelect( ( select ) => {
	const { getEntityRecord } = select( 'core' );
	const { getEditedPostAttribute } = select( 'core/editor' );
	const templateClasses = map( getEditedPostAttribute( 'template_part_types' ), ( typeId ) => {
		const typeName = get(
			getEntityRecord( 'taxonomy', 'wp_template_part_type', typeId ),
			'name',
			''
		);
		if ( typeName.endsWith( '-header' ) ) {
			return 'fse-header';
		}
		if ( typeName.endsWith( '-footer' ) ) {
			return 'fse-footer';
		}
	} );
	return { templateClasses };
} )( ( { templateClasses } ) => {
	const blockListInception = setInterval( () => {
		const blockListParent = document.querySelector( '.editor-styles-wrapper' );

		if ( ! blockListParent ) {
			return;
		}
		clearInterval( blockListInception );

		blockListParent.className = classNames(
			'editor-styles-wrapper',
			'a8c-template-editor fse-template-part',
			...templateClasses
		);
	} );

	return null;
} );

if ( 'wp_template_part' === fullSiteEditing.editorPostType ) {
	registerPlugin( 'fse-editor-template-classes', {
		render: EditorTemplateClasses,
	} );
}
