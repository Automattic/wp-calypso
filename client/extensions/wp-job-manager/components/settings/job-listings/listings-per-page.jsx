/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';

const ListingsPerPage = ( { isDisabled, onChange, value } ) => (
	<FormTextInput
		disabled={ isDisabled }
		min="0"
		onChange={ onChange( 'job_manager_per_page' ) }
		step="1"
		type="number"
		value={ value } />
);

export default ListingsPerPage;
