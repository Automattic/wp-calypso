/* global fullSiteEditing */
/* eslint-disable wpcalypso/import-docblock */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
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
import PostAutocomplete from '../post-autocomplete';

const TemplateSidebar = compose(
	withDispatch( dispatch => ( {
		setTemplateId: templateId =>
			dispatch( 'core/editor' ).editPost( { meta: { wp_template_id: templateId } } ),
	} ) ),
	withSelect( select => {
		const { getEntityRecord } = select( 'core' );
		const templateId = get(
			select( 'core/editor' ).getEditedPostAttribute( 'meta' ),
			'wp_template_id'
		);
		return {
			selectedTemplate: getEntityRecord( 'postType', 'wp_template', templateId ),
		};
	} )
)( ( { setTemplateId, selectedTemplate } ) => {
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
						defaultValue={ get( selectedTemplate, 'title.rendered' ) }
						onSelectPost={ onSelectTemplate }
						postType="wp_template"
					/>
				</PanelBody>
			</PluginSidebar>
		</Fragment>
	);
} );

if ( 'wp_template' !== fullSiteEditing.editorPostType ) {
	registerPlugin( 'fse-template-sidebar', {
		render: TemplateSidebar,
	} );
}
