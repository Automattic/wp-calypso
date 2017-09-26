/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dropdown from '../dropdown';
import TextField from '../text-field';

const StateDropdown = ( props ) => {
	const statesMap = ( props.countriesData[ props.countryCode ] || {} ).states;

	if ( ! statesMap ) { // We don't have a list of states for this country
		return (
			<TextField { ...props } />
		);
	}

	if ( ! Object.keys( statesMap ).length ) { // This country has no states
		return null;
	}

	return (
		<Dropdown
			{ ...props }
			valuesMap={ { '': props.translate( 'Select one…' ), ...statesMap } }
			/>
	);
};

StateDropdown.propTypes = {
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

export default localize( StateDropdown );
