/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { identity, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import getCountries from 'state/selectors/get-countries';
import QueryDomainCountries from 'components/data/query-countries/domains';
import { CountrySelect, Input } from 'my-sites/domains/components/form';
import { getPostCodeLabelText } from './utils.js';

export class GAppsFieldset extends Component {
	static propTypes = {
		countryCode: PropTypes.string,
		countriesList: PropTypes.array.isRequired,
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
			<div className="custom-form-fieldsets__address-fields g-apps-fieldset">
				<QueryDomainCountries />
				<CountrySelect
					label={ translate( 'Country' ) }
					countriesList={ this.props.countriesList }
					{ ...getFieldProps( 'country-code', true ) }
				/>

				<Input
					label={ getPostCodeLabelText( countryCode ) }
					{ ...getFieldProps( 'postal-code', true ) }
				/>
			</div>
		);
	}
}

export default connect( state => ( {
	countriesList: getCountries( state, 'domains' ),
} ) )( localize( GAppsFieldset ) );
