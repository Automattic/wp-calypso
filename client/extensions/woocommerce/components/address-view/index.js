/** @format */

/**
 * External dependencies
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { every, find, isEmpty, trim } from 'lodash';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
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

	constructor( props ) {
		super( props );
		this.state = {
			showAddressLine2: ! isEmpty( trim( props.address.street2 ) ),
		};
	}

	componentWillReceiveProps = newProps => {
		// We allow address line 2 to unhide -- but once shown, we don't hide it
		// because that's visually disturbing
		if ( ! isEmpty( trim( newProps.address.street2 ) ) ) {
			this.setState( { showAddressLine2: true } );
		}
	};

	onChangeCountry = event => {
		// First, always forward the country event through
		this.props.onChange( event );

		// Then, send a second onChange to clear state
		this.props.onChange( { target: { name: 'state', value: '' } } );
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
		const { address: { country }, showAllLocations, translate } = this.props;
		if ( showAllLocations ) {
			return (
				<FormFieldSet className="address-view__country">
					<FormCountrySelectFromApi value={ country } onChange={ this.onChangeCountry } />
				</FormFieldSet>
			);
		}
		return (
			<FormFieldSet className="address-view__country">
				<FormLabel>{ translate( 'Country' ) }</FormLabel>
				<FormSelect name="country" onChange={ this.onChangeCountry } value={ country || 'US' }>
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

	onClickShowAddressLine2 = event => {
		event.preventDefault();
		this.setState( { showAddressLine2: true } );
	};

	renderAddressLine2 = () => {
		const { address, onChange, translate } = this.props;
		const { street2 } = address;
		const { showAddressLine2 } = this.state;

		if ( showAddressLine2 ) {
			return (
				<FormFieldSet>
					<FormTextInput name="street2" onChange={ onChange } value={ street2 } />
				</FormFieldSet>
			);
		}

		return (
			<Button
				borderless
				className="address-view__show-line-2"
				onClick={ this.onClickShowAddressLine2 }
			>
				<Gridicon icon="plus-small" />
				{ translate( 'Add Address Line 2' ) }
			</Button>
		);
	};

	renderEditable = () => {
		const { onChange, translate } = this.props;
		const { city, postcode, street } = this.props.address;

		return (
			<div className="address-view__fields-editable">
				<FormFieldSet>
					<FormLabel>{ translate( 'Street address' ) }</FormLabel>
					<FormTextInput name="street" onChange={ onChange } value={ street } />
				</FormFieldSet>
				{ this.renderAddressLine2() }
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

	renderStreetAddress = ( { street, street2 } ) => {
		if ( ! street && ! street2 ) {
			return null;
		}
		return (
			<Fragment>
				<p>{ street }</p>
				{ street2 && <p>{ street2 }</p> }
			</Fragment>
		);
	};

	renderCityAddress = ( { city, state, postcode } ) => {
		if ( ! city && ! state && ! postcode ) {
			return null;
		}
		return (
			<p>
				{ city && <span className="address-view__city">{ city }, </span> }
				{ state && <span className="address-view__state">{ state } &nbsp;</span> }
				{ postcode && <span className="address-view__postcode">{ postcode }</span> }
			</p>
		);
	};

	renderStatic = () => {
		if ( every( this.props.address, isEmpty ) ) {
			return null;
		}

		const { name, country } = this.props.address;
		const countryData = find( getCountries(), { code: country } );

		return (
			<div className="address-view__fields-static">
				{ name && <p className="address-view__address-name">{ name }</p> }
				{ this.renderStreetAddress( this.props.address ) }
				{ this.renderCityAddress( this.props.address ) }
				{ country && <p>{ countryData ? countryData.name : country }</p> }
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
