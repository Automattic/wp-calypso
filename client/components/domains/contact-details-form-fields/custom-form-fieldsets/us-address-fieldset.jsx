/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { identity, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { StateSelect, Input } from 'my-sites/domains/components/form';

const UsAddressFieldset = props => {
	const { getFieldProps, translate, countryCode } = props;
	return (
		<div className="custom-form-fieldsets__address-fields us-address-fieldset">
			<Input label={ translate( 'City' ) } { ...getFieldProps( 'city', true ) } />
			<StateSelect
				label={ translate( 'State' ) }
				countryCode={ countryCode }
				{ ...getFieldProps( 'state', true ) }
			/>
			<Input label={ translate( 'Postal Code' ) } { ...getFieldProps( 'postal-code', true ) } />
		</div>
	);
};

UsAddressFieldset.propTypes = {
	countryCode: PropTypes.string,
	getFieldProps: PropTypes.func,
	translate: PropTypes.func,
};

UsAddressFieldset.defaultProps = {
	countryCode: 'US',
	getFieldProps: noop,
	translate: identity,
};

export default localize( UsAddressFieldset );
