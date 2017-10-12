/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { getCountries } from 'woocommerce/lib/countries';
import FormCountrySelectFromApi from 'woocommerce/components/form-location-select/countries';
import FormStateSelectFromApi from 'woocommerce/components/form-location-select/states';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';

class AddressView extends Component {
	static propTypes = {
		address: PropTypes.shape( {
			street: PropTypes.string.isRequired,
			street2: PropTypes.string,
			city: PropTypes.string.isRequired,
			state: PropTypes.string,
			country: PropTypes.string.isRequired,
			postcode: PropTypes.string,
		} ),
		isEditable: PropTypes.bool,
		onChange: PropTypes.func,
		showAllLocations: PropTypes.bool,
	};

	static defaultProps = {
		address: {
			street: '',
			street2: '',
			city: '',
			state: 'AL',
			country: 'US',
			postcode: '',
		},
		isEditable: false,
		showAllLocations: false,
	};

	getCountryData = () => {
		const { country } = this.props.address;
		let countryData = find( getCountries(), { code: country || 'US' } );

		// If we still haven't found any country data, default to US.
		// This will catch any case where `country` is defined, but not a supported country.
		if ( ! Boolean( countryData ) ) {
			countryData = find( getCountries(), { code: 'US' } );
		}
		return countryData;
	};

	renderCountry = () => {
		const { address: { country }, onChange, showAllLocations, translate } = this.props;
		if ( showAllLocations ) {
			return (
				<FormFieldSet className="address-view__country">
					<FormCountrySelectFromApi value={ country } onChange={ onChange } />
				</FormFieldSet>
			);
		}
		return (
			<FormFieldSet className="address-view__country">
				<FormLabel>{ translate( 'Country' ) }</FormLabel>
				<FormSelect name="country" onChange={ onChange } value={ country || 'US' }>
					{ getCountries().map( option => {
						return (
							<option key={ option.code } value={ option.code }>
								{ option.name }
							</option>
						);
					} ) }
					<option key="XX" value="XX" disabled="disabled">
						{ translate( 'More countries coming soon' ) }
					</option>
				</FormSelect>
			</FormFieldSet>
		);
	};

	renderState = () => {
		const { address: { country, state }, onChange, showAllLocations } = this.props;
		if ( showAllLocations ) {
			return (
				<FormFieldSet className="address-view__editable-state">
					<FormStateSelectFromApi country={ country } value={ state } onChange={ onChange } />
				</FormFieldSet>
			);
		}

		const { states, statesLabel } = this.getCountryData();
		return (
			<FormFieldSet className="address-view__editable-state">
				<FormLabel>{ statesLabel }</FormLabel>
				<FormSelect name="state" onChange={ onChange } value={ state }>
					{ states.map( option => {
						return (
							<option key={ option.code } value={ option.code }>
								{ option.name }
							</option>
						);
					} ) }
				</FormSelect>
			</FormFieldSet>
		);
	};

	renderEditable = () => {
		const { onChange, translate } = this.props;
		const { city, postcode, street, street2 } = this.props.address;

		return (
			<div className="address-view__fields-editable">
				<FormFieldSet>
					<FormLabel>{ translate( 'Street address' ) }</FormLabel>
					<FormTextInput name="street" onChange={ onChange } value={ street } />
				</FormFieldSet>
				<FormFieldSet>
					<FormTextInput name="street2" onChange={ onChange } value={ street2 } />
				</FormFieldSet>
				<div className="address-view__editable-city-state-postcode">
					<FormFieldSet>
						<FormLabel>{ translate( 'City' ) }</FormLabel>
						<FormTextInput name="city" onChange={ onChange } value={ city } />
					</FormFieldSet>
					{ this.renderState() }
					<FormFieldSet>
						<FormLabel>{ translate( 'Postal code' ) }</FormLabel>
						<FormTextInput name="postcode" onChange={ onChange } value={ postcode } />
					</FormFieldSet>
				</div>
				{ this.renderCountry() }
			</div>
		);
	};

	renderStatic = () => {
		const { name, street, street2, city, state, postcode, country } = this.props.address;
		return (
			<div className="address-view__fields-static">
				<p className="address-view__address-name">{ name }</p>
				<p>{ street }</p>
				{ street2 && <p>{ street2 }</p> }
				<p>
					{ city && <span className="address-view__city">{ city }</span> }
					{ state && <span className="address-view__state">{ state }</span> }
					{ postcode && <span className="address-view__postcode">{ postcode }</span> }
				</p>
				<p>{ country }</p>
			</div>
		);
	};

	render = () => {
		const { className, isEditable } = this.props;
		const classes = classNames( 'address-view__address', className );

		return (
			<div className={ classes }>{ isEditable ? this.renderEditable() : this.renderStatic() }</div>
		);
	};
}

export default localize( AddressView );
