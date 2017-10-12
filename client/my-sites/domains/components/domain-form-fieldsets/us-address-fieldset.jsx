/**
 * External dependencies
 *
 * @format
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import identity from 'lodash/identity';
import noop from 'lodash/noop';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { StateSelect, Input, HiddenInput } from 'my-sites/domains/components/form';

export class UsAddressFieldset extends Component {
	static propTypes = {
		countryCode: PropTypes.string,
		getFieldProps: PropTypes.func,
		translate: PropTypes.func,
	};

	static defaultProps = {
		countryCode: 'US',
		getFieldProps: noop,
		translate: identity,
	};

	render() {
		const { getFieldProps, translate, countryCode } = this.props;
		return (
			<div className="domain-form-fieldsets__address-fields us-address-fieldset">
				<div>
					<Input
						label={ translate( 'Address' ) }
						maxLength={ 40 }
						{ ...getFieldProps( 'address-1', true ) }
					/>

					<HiddenInput
						label={ translate( 'Address Line 2' ) }
						text={ translate( '+ Add Address Line 2' ) }
						maxLength={ 40 }
						{ ...getFieldProps( 'address-2', true ) }
					/>
				</div>
				<Input label={ translate( 'City' ) } { ...getFieldProps( 'city', true ) } />
				<StateSelect
					label={ translate( 'State' ) }
					countryCode={ countryCode }
					{ ...getFieldProps( 'state', true ) }
				/>
				<Input label={ translate( 'Postal Code' ) } { ...getFieldProps( 'postal-code', true ) } />
			</div>
		);
	}
}

export default localize( UsAddressFieldset );
