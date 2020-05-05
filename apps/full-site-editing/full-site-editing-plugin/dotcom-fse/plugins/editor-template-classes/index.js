/* eslint-disable import/no-extraneous-dependencies */
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

const EditorTemplateClasses = withSelect( ( select ) => {
	const { getEntityRecord } = select( 'core' );
	const { getEditedPostAttribute } = select( 'core/editor' );
	const templateClasses = map( getEditedPostAttribute( 'template_part_types' ), ( typeId ) => {
		const typeName = get(
			getEntityRecord( 'taxonomy', 'wp_template_part_type', typeId ),
			'name',
			''
		);
		if ( endsWith( typeName, '-header' ) ) {
			return 'fse-header';
		}
		if ( endsWith( typeName, '-footer' ) ) {
			return 'fse-footer';
		}
	} );
	return { templateClasses };
} )( ( { templateClasses } ) => {
	const blockListInception = setInterval( () => {
		const blockListParent = document.querySelector( '.block-editor__typewriter > div' );

		if ( ! blockListParent ) {
			return;
		}
		clearInterval( blockListInception );

		blockListParent.className = classNames(
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
