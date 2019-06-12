/* global fullSiteEditing */
/**
 * External dependencies
 */
import { useEffect, useState } from 'react';
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { createBlock, parse } from '@wordpress/blocks';
import { PanelBody } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import PostAutocomplete from '../../components/post-autocomplete';

const TemplateSelectorSidebar = compose(
	withDispatch( dispatch => ( {
		setTemplateId: templateId =>
			dispatch( 'core/editor' ).editPost( { meta: { _wp_template_id: templateId } } ),
		resetBlocks: dispatch( 'core/block-editor' ).resetBlocks,
	} ) ),
	withSelect( select => {
		const { canUser, getEntityRecord } = select( 'core' );
		const { getBlocks, getEditedPostAttribute } = select( 'core/editor' );
		const templateId = get( getEditedPostAttribute( 'meta' ), '_wp_template_id' );

		return {
			canUserUpdateSettings: canUser( 'update', 'settings' ),
			contentBlocks: getBlocks(),
			selectedTemplate: templateId && getEntityRecord( 'postType', 'wp_template', templateId ),
			templateId,
		};
	} )
)(
	( {
		canUserUpdateSettings,
		contentBlocks,
		resetBlocks,
		setTemplateId,
		selectedTemplate,
		templateId,
	} ) => {
		if ( ! canUserUpdateSettings ) {
			return null;
		}

		useEffect( () => {
			const [ templateMerged, setTemplateMerged ] = useState( false );

			if ( ! selectedTemplate || templateMerged ) {
				return;
			}

			const templateBlocks = parse( get( selectedTemplate, [ 'content', 'raw' ] ) );

			const mergedBlocks = templateBlocks.map( ( { name, attributes } ) => {
				if ( 'a8c/post-content' === name ) {
					return createBlock(
						'a8c/post-content', //for clarity
						attributes,
						contentBlocks.map( contentBlock =>
							createBlock( contentBlock.name, contentBlock.attributes )
						)
					);
				}

				return createBlock( name, attributes );
			} );

			resetBlocks( mergedBlocks );
			setTemplateMerged( true );
		}, [ templateId ] );

		const onSelectTemplate = ( { id } ) => {
			setTemplateId( parseInt( id, 10 ) );
		};

		return (
			<Fragment>
				<PluginSidebarMoreMenuItem target="fse-template-sidebar" icon="layout">
					{ __( 'Template' ) }
				</PluginSidebarMoreMenuItem>
				<PluginSidebar icon="layout" name="fse-template-sidebar" title={ __( 'Template' ) }>
					<PanelBody>
						{ __( 'Select a template' ) }
						<PostAutocomplete
							initialValue={ get( selectedTemplate, [ 'title', 'rendered' ] ) }
							onSelectPost={ onSelectTemplate }
							postType="wp_template"
						/>
					</PanelBody>
				</PluginSidebar>
			</Fragment>
		);
	}
);

if ( 'page' === fullSiteEditing.editorPostType ) {
	registerPlugin( 'fse-template-selector-sidebar', {
		render: TemplateSelectorSidebar,
	} );
}
