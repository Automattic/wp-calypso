/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { identity, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CountrySelect, Input } from 'my-sites/domains/components/form';
import { forDomainRegistrations as countriesList } from 'lib/countries-list';

export class GAppsFieldset extends Component {
	static propTypes = {
		getFieldProps: PropTypes.func,
		translate: PropTypes.func,
	};

	static defaultProps = {
		getFieldProps: noop,
		translate: identity,
	};

	render() {
		const { getFieldProps, translate } = this.props;
		return (
			<div className="custom-form-fieldsets__address-fields g-apps-fieldset">
				<CountrySelect
					label={ translate( 'Country' ) }
					countriesList={ countriesList }
					{ ...getFieldProps( 'country-code', true ) }
				/>
				<Input label={ translate( 'Postal Code' ) } { ...getFieldProps( 'postal-code', true ) } />
			</div>
		);
	}
}

export default localize( GAppsFieldset );
