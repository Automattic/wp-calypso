/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Dropdown from '../dropdown';

const CountryDropdown = ( props ) => {
	const valuesMap = {};
	Object.keys( props.countriesData ).forEach( ( countryCode ) => {
		valuesMap[ countryCode ] = props.countriesData[ countryCode ].name;
	} );
	return (
		<Dropdown
			{ ...props }
			valuesMap={ valuesMap }
			/>
	);
};

CountryDropdown.propTypes = {
	id: PropTypes.string.isRequired,
	countriesData: PropTypes.object.isRequired,
	title: PropTypes.string,
	description: PropTypes.string,
	value: PropTypes.string.isRequired,
	updateValue: PropTypes.func.isRequired,
	error: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.bool,
	] ),
	className: PropTypes.string,
};

export default CountryDropdown;
