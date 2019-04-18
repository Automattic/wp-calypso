/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import FormSelect from 'components/forms/form-select';

const DomainsSelect = ( { domains, isError, onChange, value } ) => {
	return (
		<FormSelect value={ value } onChange={ onChange } isError={ isError }>
			{ domains.map( domain => {
				return (
					<option value={ domain.name } key={ domain.name }>
						@{ domain.name }
					</option>
				);
			} ) }
		</FormSelect>
	);
};

DomainsSelect.propTypes = {
	domains: PropTypes.array.isRequired,
	isError: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
	value: PropTypes.string.isRequired,
};

DomainsSelect.defaultProps = {
	isError: false,
};

export default DomainsSelect;
