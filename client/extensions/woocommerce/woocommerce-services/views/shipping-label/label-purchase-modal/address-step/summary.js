/** @format */

/**
 * External dependencies
 */
import React from 'react';

const AddressSummary = ( {
	values,
	originalValues,
	countryNames,
	stateNames,
	expandStateName = false,
} ) => {
	originalValues = originalValues || {};
	const { state, country } = values;

	let stateStr = '';
	if ( state ) {
		const statesMap = ( expandStateName && stateNames ) || {};
		stateStr = statesMap[ state ] || state;
	}
	const countryStr = countryNames[ country ] || country;

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
		<div className="address-step__summary">
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
