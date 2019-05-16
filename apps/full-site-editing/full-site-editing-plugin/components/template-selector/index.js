/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import { filter, intersection, isArray, map } from 'lodash';

/**
 * WordPress dependencies
 */
import { SelectControl } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';

const TemplateSelector = withSelect( ( select, { types } ) => {
	const { getEntityRecords } = select( 'core' );

	const allTemplateTypes = getEntityRecords( 'taxonomy', 'wp_template_type' );
	const filteredTemplateTypes = types
		? filter( allTemplateTypes, type => {
				return isArray( types ) ? -1 !== types.indexOf( type.slug ) : types === type.slug;
		  } )
		: allTemplateTypes;
	const templateTypesIds = map( filteredTemplateTypes, ( { id } ) => id );

	const allTemplates = getEntityRecords( 'postType', 'wp_template', { per_page: -1 } );
	const filteredTemplates = types
		? filter(
				allTemplates,
				( { template_types } ) => intersection( template_types, templateTypesIds ).length
		  )
		: allTemplates;
	const templates = [
		{},
		...map( filteredTemplates, ( { id, title } ) => ( {
			label: title.rendered,
			value: id,
		} ) ),
	];
	return {
		templates,
	};
} )( ( { initialValue, onSelectTemplate, templates } ) => {
	const [ templateId, setTemplateId ] = useState( initialValue );

	const onChange = id => {
		setTemplateId( id );
		onSelectTemplate( parseInt( id, 10 ) );
	};

	return (
		<div className="a8c-template-selector">
			<SelectControl onChange={ onChange } options={ templates } value={ templateId } />
		</div>
	);
} );

export default TemplateSelector;
