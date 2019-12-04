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
import { getStateLabelText, getPostCodeLabelText, STATE_SELECT_TEXT } from './utils.js';

const UsAddressFieldset = props => {
	const { getFieldProps, translate, countryCode } = props;
	return (
		<div className="custom-form-fieldsets__address-fields us-address-fieldset">
			<Input label={ translate( 'City' ) } { ...getFieldProps( 'city' ) } />
			<StateSelect
				label={ getStateLabelText( countryCode ) }
				countryCode={ countryCode }
				selectText={ STATE_SELECT_TEXT[ countryCode ] }
				{ ...getFieldProps( 'state', true ) }
			/>
			<Input label={ getPostCodeLabelText( countryCode ) } { ...getFieldProps( 'postal-code' ) } />
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
