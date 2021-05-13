/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { StateSelect, Input } from 'calypso/my-sites/domains/components/form';
import { getStateLabelText, getPostCodeLabelText, STATE_SELECT_TEXT } from './utils.js';

const noop = () => {};

const UsAddressFieldset = ( props ) => {
	const { getFieldProps, translate, countryCode, contactDetailsErrors } = props;
	return (
		<div className="custom-form-fieldsets__address-fields us-address-fieldset">
			<Input
				label={ translate( 'City' ) }
				{ ...getFieldProps( 'city', { customErrorMessage: contactDetailsErrors?.city } ) }
			/>
			<StateSelect
				label={ getStateLabelText( countryCode ) }
				countryCode={ countryCode }
				selectText={ STATE_SELECT_TEXT[ countryCode ] }
				{ ...getFieldProps( 'state', {
					needsChildRef: true,
					customErrorMessage: contactDetailsErrors?.state,
				} ) }
			/>
			<Input
				label={ getPostCodeLabelText( countryCode ) }
				{ ...getFieldProps( 'postal-code', {
					customErrorMessage: contactDetailsErrors?.postalCode,
				} ) }
			/>
		</div>
	);
};

UsAddressFieldset.propTypes = {
	countryCode: PropTypes.string,
	getFieldProps: PropTypes.func,
	translate: PropTypes.func,
	contactDetailsErrors: PropTypes.object,
};

UsAddressFieldset.defaultProps = {
	countryCode: 'US',
	getFieldProps: noop,
};

export default localize( UsAddressFieldset );
