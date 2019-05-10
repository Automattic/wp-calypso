/* global fullSiteEditing */
/**
 * External dependencies
 */
import { concat, debounce, get, filter, map, without } from 'lodash';

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
		{ label: __( 'Front Page' ), slug: 'front-page' },
		{ label: __( 'Default List' ), slug: 'index' },
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
} ) )( ( { templateHierarchyOptions } ) => {
	const [ hierarchy, setHierarchy ] = useState();

	useEffect( () => {
		const fetchTemplateHierarchySetting = async () => {
			const settings = await apiFetch( {
				path: '/wp/v2/settings',
			} );
			setHierarchy( JSON.parse( get( settings, 'template_hierarchy' ) ) );
		};
		fetchTemplateHierarchySetting();
	}, [] );

	const isTemplateAssigned = value => !! hierarchy && -1 !== hierarchy.indexOf( value );

	const onChange = value => () => {
		const newHierarchy = isTemplateAssigned( value )
			? without( hierarchy, value )
			: concat( hierarchy, value );
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
								label={ label }
								checked={ isTemplateAssigned( slug ) }
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
