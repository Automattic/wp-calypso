/* global fullSiteEditing */
/**
 * External dependencies
 */
import { debounce, get, filter, map, omit } from 'lodash';

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { CheckboxControl, PanelBody } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import { Fragment, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';

const getTemplateHierarchyOption = postTypes => {
	const options = map( filter( postTypes, 'viewable' ), postType => ( {
		label: get( postType, [ 'labels', 'name' ] ),
		slug: get( postType, 'slug' ),
	} ) );
	return [
		{ label: __( 'Default' ), slug: 'index' },
		{ label: __( 'Default Singular' ), slug: 'singular' },
		...options,
	];
};

const updateTemplateHierarchyOption = debounce( async hierarchy => {
	await apiFetch( {
		path: '/wp/v2/settings',
		data: {
			template_hierarchy: JSON.stringify( hierarchy ),
		},
		method: 'POST',
	} );
}, 500 );

const TemplateHierarchySidebar = withSelect( select => ( {
	templateHierarchyOptions: getTemplateHierarchyOption(
		select( 'core' ).getEntityRecords( 'root', 'postType' )
	),
	templateId: select( 'core/editor' ).getCurrentPostId(),
} ) )( ( { templateHierarchyOptions, templateId } ) => {
	const [ hierarchy, setHierarchy ] = useState( {} );

	useEffect( () => {
		const fetchTemplateHierarchySetting = async () => {
			const settings = await apiFetch( {
				path: '/wp/v2/settings',
			} );
			setHierarchy( JSON.parse( get( settings, 'template_hierarchy' ) ) );
		};
		fetchTemplateHierarchySetting();
	}, [] );

	const isCurrentTemplateAssignedToScreen = slug => templateId === hierarchy[ slug ];

	const hasScreenAnotherTemplate = slug => !! hierarchy[ slug ] && templateId !== hierarchy[ slug ];

	const onChange = slug => () => {
		const newHierarchy = isCurrentTemplateAssignedToScreen( slug )
			? omit( hierarchy, slug )
			: { ...hierarchy, [ slug ]: templateId };
		setHierarchy( newHierarchy );
		updateTemplateHierarchyOption( newHierarchy );
	};

	return (
		<Fragment>
			<PluginSidebarMoreMenuItem target="fse-template-sidebar" icon="layout">
				{ __( 'Template Hierarchy' ) }
			</PluginSidebarMoreMenuItem>
			<PluginSidebar icon="layout" name="fse-template-sidebar" title={ __( 'Template Hierarchy' ) }>
				<PanelBody>
					<p>{ __( 'Assign this template to any of these screens:' ) }</p>
					{ map( templateHierarchyOptions, ( { label, slug } ) => (
						<div>
							<CheckboxControl
								checked={ isCurrentTemplateAssignedToScreen( slug ) }
								disabled={ hasScreenAnotherTemplate( slug ) }
								help={
									hasScreenAnotherTemplate( slug ) && (
										<Fragment>
											{ __( 'Another template is assigned to this screen. ' ) }
											<a href={ `post.php?post=${ hierarchy[ slug ] }&action=edit` }>
												{ __( 'Edit' ) }
											</a>
										</Fragment>
									)
								}
								label={ label }
								onChange={ onChange( slug ) }
							/>
						</div>
					) ) }
				</PanelBody>
			</PluginSidebar>
		</Fragment>
	);
} );

if ( 'wp_template' === fullSiteEditing.editorPostType ) {
	registerPlugin( 'fse-template-hierarchy-sidebar', {
		render: TemplateHierarchySidebar,
	} );
}
