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
	const templates = map(
		getEntityRecords( 'postType', 'wp_template', { per_page: -1 } ),
		( { id, title } ) => ( {
			label: title.rendered,
			value: id,
		} )
	);
	return {
		templates,
	};
} )( ( { initialValue, onSelectTemplate, templates } ) => {
	const [ templateId, setTemplateId ] = useState( initialValue );

	const onChange = id => {
		setTemplateId( id );
		onSelectTemplate( id );
	};

	return (
		<div className="a8c-template-selector">
			<SelectControl onChange={ onChange } options={ templates } value={ templateId } />
		</div>
	);
} );

export default TemplateSelector;
