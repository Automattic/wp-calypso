/* global fullSiteEditing */

import { withSelect } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';
import classNames from 'classnames';
import { get, map } from 'lodash';
import { useEffect } from 'react';

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
	useEffect( () => {
		// templateClasses will be an array with an undefined element when loading.
		if ( ! templateClasses.some( ( templateClass ) => undefined !== templateClass ) ) {
			return;
		}

		const blockListInception = setInterval( () => {
			const blockListParent = document.querySelector(
				'.editor-styles-wrapper > .block-editor-block-list__layout'
			);

			if ( ! blockListParent ) {
				return;
			}

			clearInterval( blockListInception );

			if ( ! blockListParent.className.includes( 'a8c-template-editor fse-template-part' ) ) {
				blockListParent.className = classNames(
					blockListParent.className,
					'a8c-template-editor fse-template-part',
					...templateClasses
				);
			}
		}, 100 );

		return () => clearInterval( blockListInception );
	}, [ ...templateClasses ] ); // eslint-disable-line react-hooks/exhaustive-deps
	return null;
} );

if ( 'wp_template_part' === fullSiteEditing.editorPostType ) {
	registerPlugin( 'fse-editor-template-classes', {
		render: EditorTemplateClasses,
	} );
}
