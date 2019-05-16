/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import { map } from 'lodash';

/**
 * WordPress dependencies
 */
import { SelectControl } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';

const TemplateSelector = withSelect( select => {
	const { getEntityRecords } = select( 'core' );
	return {
		templates: getEntityRecords( 'postType', 'wp_template', { per_page: -1 } ),
	};
} )( ( { initialValue, onSelectTemplate, templates } ) => {
	const [ templateId, setTemplateId ] = useState( initialValue );

	const selectOptions = [
		{},
		...map( templates, ( { id, title } ) => ( {
			label: title.rendered,
			value: id,
		} ) ),
	];

	const onChange = id => {
		setTemplateId( id );
		onSelectTemplate( parseInt( id, 10 ) );
	};

	return (
		<div className="a8c-template-selector">
			<SelectControl onChange={ onChange } options={ selectOptions } value={ templateId } />
		</div>
	);
} );

export default TemplateSelector;
