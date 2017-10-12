/**
 * External	 dependencies
 *
 * @format
 */

import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import {
	CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES,
	CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES,
} from './constants';
import UsAddressFieldset from './us-address-fieldset';
import EuAddressFieldset from './eu-address-fieldset';
import UkAddressFieldset from './uk-address-fieldset';

const RegionAddressFieldsets = props => {
	const { countryCode } = props;

	if ( includes( CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES, countryCode ) ) {
		return <EuAddressFieldset { ...props } />;
	}
	if ( includes( CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES, countryCode ) ) {
		return <UkAddressFieldset { ...props } />;
	}
	return <UsAddressFieldset { ...props } />;
};

RegionAddressFieldsets.propTypes = {
	getFieldProps: PropTypes.func,
	countryCode: PropTypes.string,
};

RegionAddressFieldsets.defaultProps = {
	getFieldProps: noop,
	countryCode: 'US',
};

export default RegionAddressFieldsets;
