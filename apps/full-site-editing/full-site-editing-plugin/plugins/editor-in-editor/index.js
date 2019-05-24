/* global fullSiteEditing */
/**
 * External dependencies
 */
import { forEach, get, map } from 'lodash';

/**
 * WordPress dependencies
 */
import { createBlock, parse } from '@wordpress/blocks';
import { compose } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';

function parseTemplate( template ) {
	const templateBlocks = parse( get( template, [ 'content', 'raw' ] ) );

	const beforeContent = [];
	const afterContent = [];

	let passedPostContent = false;
	forEach( templateBlocks, block => {
		const blockName = get( block, [ 'attributes', 'originalName' ] );
		if ( 'a8c/post-content' === blockName ) {
			passedPostContent = true;
			return;
		}
		if ( 'core/missing' === block.name ) {
			return;
		}

		if ( passedPostContent ) {
			afterContent.push( block );
		} else {
			beforeContent.push( block );
		}
	} );

	return { beforeContent, afterContent };
}

const EditorInEditor = compose(
	withDispatch( dispatch => {
		const { insertBlock } = dispatch( 'core/block-editor' );
		return {
			insertBlock,
		};
	} ),
	withSelect( select => {
		const { getEntityRecord } = select( 'core' );
		const { getEditedPostAttribute, __unstableIsEditorReady: isEditorReady } = select(
			'core/editor'
		);

		const templateId = get( getEditedPostAttribute( 'meta' ), '_wp_template_id' );

		return {
			isEditorReady,
			template: templateId && getEntityRecord( 'postType', 'wp_template', templateId ),
		};
	} )
)( ( { insertBlock, template } ) => {
	if ( ! template ) {
		return null;
	}

	const parsedTemplate = parseTemplate( template );

	const beforeContent = createBlock(
		'core/group',
		{
			align: 'full',
			customBackgroundColor: '#eeeeee',
		},
		map( parsedTemplate.beforeContent, ( { name, attributes } ) => createBlock( name, attributes ) )
	);
	insertBlock( beforeContent, 0 );

	const afterContent = createBlock(
		'core/group',
		{
			align: 'full',
			customBackgroundColor: '#eeeeee',
		},
		map( parsedTemplate.afterContent, ( { name, attributes } ) => createBlock( name, attributes ) )
	);
	insertBlock( afterContent );

	return null;
} );

if ( 'page' === fullSiteEditing.editorPostType ) {
	registerPlugin( 'fse-editor-in-editor', {
		render: EditorInEditor,
	} );
}
