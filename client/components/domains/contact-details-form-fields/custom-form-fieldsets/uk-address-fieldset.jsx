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
import { Input } from 'my-sites/domains/components/form';

const UkAddressFieldset = props => {
	const { getFieldProps, translate } = props;
	return (
		<div className="custom-form-fieldsets__address-fields uk-address-fieldset">
			<Input label={ translate( 'City' ) } { ...getFieldProps( 'city', true ) } />
			<Input label={ translate( 'Postal Code' ) } { ...getFieldProps( 'postal-code', true ) } />
		</div>
	);
};

UkAddressFieldset.propTypes = {
	getFieldProps: PropTypes.func,
	translate: PropTypes.func,
};

UkAddressFieldset.defaultProps = {
	getFieldProps: noop,
	translate: identity,
};
export default localize( UkAddressFieldset );
