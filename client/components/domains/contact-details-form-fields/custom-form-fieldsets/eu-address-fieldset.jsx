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

const EuAddressFieldset = props => {
	const { getFieldProps, translate, contactDetailsErrors } = props;
	return (
		<div className="custom-form-fieldsets__address-fields eu-address-fieldset">
			<Input
				label={ translate( 'Postal Code' ) }
				errorMessage={ contactDetailsErrors?.postalCode }
				{ ...getFieldProps( 'postal-code' ) }
			/>
			<Input
				label={ translate( 'City' ) }
				errorMessage={ contactDetailsErrors?.city }
				{ ...getFieldProps( 'city' ) }
			/>
		</div>
	);
};

EuAddressFieldset.propTypes = {
	getFieldProps: PropTypes.func,
	translate: PropTypes.func,
	contactDetailsErrors: PropTypes.object,
};

EuAddressFieldset.defaultProps = {
	getFieldProps: noop,
	translate: identity,
	contactDetailsErrors: {},
};

export default localize( EuAddressFieldset );
