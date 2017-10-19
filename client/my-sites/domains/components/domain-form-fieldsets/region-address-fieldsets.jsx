/**
 * External	 dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import identity from 'lodash/identity';
import noop from 'lodash/noop';
import includes from 'lodash/includes';
import { localize } from 'i18n-calypso';

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
import { Input, HiddenInput } from 'my-sites/domains/components/form';

export class RegionAddressFieldsets extends Component {
	static propTypes = {
		getFieldProps: PropTypes.func,
		translate: PropTypes.func,
		countryCode: PropTypes.string,
	};

	static defaultProps = {
		getFieldProps: noop,
		translate: identity,
		countryCode: 'US',
	};

	getRegionAddressFieldset() {
		const { countryCode } = this.props;

		if ( includes( CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES, countryCode ) ) {
			return <EuAddressFieldset { ...this.props } />;
		}

		if ( includes( CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES, countryCode ) ) {
			return <UkAddressFieldset { ...this.props } />;
		}

		return <UsAddressFieldset { ...this.props } />;
	}

	render() {
		const { getFieldProps, translate } = this.props;

		return (
			<div>
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
				{ this.getRegionAddressFieldset() }
			</div>
		);
	}
}

export default localize( RegionAddressFieldsets );
