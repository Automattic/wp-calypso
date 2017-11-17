/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import identity from 'lodash/identity';
import noop from 'lodash/noop';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CountrySelect, Input } from 'my-sites/domains/components/form';
import { forDomainRegistrations as countriesListForDomainRegistrations } from 'lib/countries-list';

const countriesList = countriesListForDomainRegistrations();

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
			<div className="domain-form-fieldsets__address-fields g-apps-fieldset">
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
