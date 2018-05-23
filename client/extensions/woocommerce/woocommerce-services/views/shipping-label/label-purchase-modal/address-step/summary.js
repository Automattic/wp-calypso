/** @format */

/**
 * External dependencies
 */
import React from 'react';

const AddressSummary = ( { values, originalValues, countriesData, expandStateName = false } ) => {
	originalValues = originalValues || {};
	const { state, country } = values;

	let stateStr = '';
	if ( state ) {
		const statesMap = ( expandStateName && ( countriesData[ country ] || {} ).states ) || {};
		stateStr = statesMap[ state ] || state;
	}
	const countryStr = countriesData[ country ].name;

	const getValue = fieldName => {
		const rawValue = values[ fieldName ];
		if ( ! rawValue ) {
			return '';
		}
		const originalValue = originalValues[ fieldName ];
		const highlight = originalValue && originalValue.toLowerCase() !== rawValue.toLowerCase();
		let value = rawValue;
		switch ( fieldName ) {
			case 'state':
				value = stateStr;
				break;
			case 'country':
				value = countryStr;
		}
		return <span className={ highlight ? 'highlight' : '' }>{ value }</span>;
	};

	return (
		<div className="address-step__suggestion-summary">
			<p>{ getValue( 'name' ) }</p>
			<p>
				{ getValue( 'address' ) } { getValue( 'address_2' ) }
			</p>
			<p>
				{ getValue( 'city' ) }, { getValue( 'state' ) }&nbsp; { getValue( 'postcode' ) }
			</p>
			<p>{ getValue( 'country' ) }</p>
		</div>
	);
};

export default AddressSummary;
