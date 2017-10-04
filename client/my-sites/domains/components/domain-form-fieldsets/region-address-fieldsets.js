/**
 * External	 dependencies
 *
 * @format
 */

import React from 'react';
import PropTypes from 'prop-types';
import identity from 'lodash/identity';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import {
	CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES,
	CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES,
} from './constants';
import UsAddressFields from './us-address-fieldset';
import EuAddressFields from './eu-address-fieldset';
import UkAddressFields from './uk-address-fieldset';

const regionAddressFieldsetComponents = [
	{
		keys: CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES,
		component: EuAddressFields,
	},
	{
		keys: CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES,
		component: UkAddressFields,
	},
];

/**
 * regionAddressFieldsetComponent Objects
 * @typedef {Object} regionAddressFieldsetDefinitionObject
 * @property {Array<String>} keys array of country codes
 * @property {ReactElement} component corresponding address for the country code
 */

/**
 * @param {Array<regionAddressFieldsetDefinitionObject>} formTypesArray array of region address fieldset components and keys
 * @param {String} key countryCode
 * @returns {ReactElement} the address field component for the countryCode
 */
function getAddressComponent( formTypesArray, key ) {
	const formTypesArrayLength = formTypesArray.length;
	let Component;
	for ( let i = 0; i < formTypesArrayLength; i++ ) {
		if ( formTypesArray[ i ].keys.indexOf( key ) > -1 ) {
			Component = formTypesArray[ i ].component;
			break;
		}
	}
	return Component;
}

const RegionAddressFieldsets = ( { getFieldProps, translate, countryCode } ) => {
	const Component =
		getAddressComponent( regionAddressFieldsetComponents, countryCode ) || UsAddressFields;
	return (
		<Component
			getFieldProps={ getFieldProps }
			translate={ translate }
			countryCode={ countryCode }
		/>
	);
};

RegionAddressFieldsets.propTypes = {
	getFieldProps: PropTypes.func,
	translate: PropTypes.func,
	countryCode: PropTypes.string,
};

RegionAddressFieldsets.defaultProps = {
	getFieldProps: noop,
	translate: identity,
	countryCode: 'US',
};

export default RegionAddressFieldsets;
