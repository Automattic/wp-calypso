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
	const STATE_LABEL = {
		CA: translate( 'Province' ),
	};
	const STATE_SELECT_TEXT = {
		CA: translate( 'Select Province' ),
	};
	const POST_CODE_LABEL = {
		US: translate( 'ZIP code' ),
	};
	return (
		<div className="custom-form-fieldsets__address-fields us-address-fieldset">
			<Input label={ translate( 'City' ) } { ...getFieldProps( 'city', true ) } />
			<StateSelect
				label={ STATE_LABEL[ countryCode ] || translate( 'State' ) }
				countryCode={ countryCode }
				selectText={ STATE_SELECT_TEXT[ countryCode ] }
				{ ...getFieldProps( 'state', true ) }
			/>
			<Input
				label={ POST_CODE_LABEL[ countryCode ] || translate( 'Postal Code' ) }
				{ ...getFieldProps( 'postal-code', true ) }
			/>
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
