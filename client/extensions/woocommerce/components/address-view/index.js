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
import FormCountrySelectFromApi from 'woocommerce/components/form-location-select/countries';
import FormStateSelectFromApi from 'woocommerce/components/form-location-select/states';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
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
		countries: PropTypes.arrayOf(
			PropTypes.shape( {
				code: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired,
				states: PropTypes.arrayOf(
					PropTypes.shape( {
						code: PropTypes.string.isRequired,
						name: PropTypes.string.isRequired,
					} )
				),
			} )
		),
		isEditable: PropTypes.bool,
		onChange: PropTypes.func,
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

	renderEditableCountry = () => {
		const { address: { country }, onChange } = this.props;

		return (
			<FormFieldSet className="address-view__country">
				<FormCountrySelectFromApi value={ country } onChange={ onChange } />
			</FormFieldSet>
		);
	};

	renderEditableState = () => {
		const { address: { country, state }, onChange } = this.props;
		return (
			<FormFieldSet className="address-view__editable-state">
				<FormStateSelectFromApi country={ country } value={ state } onChange={ onChange } />
			</FormFieldSet>
		);
	};

	onClickShowAddressLine2 = event => {
		event.preventDefault();
		this.setState( { showAddressLine2: true } );
	};

	renderEditableAddressLine2 = () => {
		const { address, onChange, translate } = this.props;
		const { street2 } = address;
		const { showAddressLine2 } = this.state;

		if ( showAddressLine2 ) {
			return (
				<FormFieldSet>
					<FormTextInput
						autoComplete="address-line2"
						name="street2"
						onChange={ onChange }
						value={ street2 }
					/>
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
					<FormTextInput
						autoComplete="address-line1"
						name="street"
						onChange={ onChange }
						value={ street }
					/>
				</FormFieldSet>
				{ this.renderEditableAddressLine2() }
				<div className="address-view__editable-city-state-postcode">
					<FormFieldSet>
						<FormLabel>{ translate( 'City' ) }</FormLabel>
						<FormTextInput
							autoComplete="address-level2"
							name="city"
							onChange={ onChange }
							value={ city }
						/>
					</FormFieldSet>
					{ this.renderEditableState() }
					<FormFieldSet>
						<FormLabel>{ translate( 'Postal code' ) }</FormLabel>
						<FormTextInput
							autoComplete="postal-code"
							name="postcode"
							onChange={ onChange }
							value={ postcode }
						/>
					</FormFieldSet>
				</div>
				{ this.renderEditableCountry() }
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

		const { address, countries } = this.props;
		const { name, country } = address;
		const countryData = find( countries, { code: country } );
		const countryName = countryData ? countryData.name : false;

		return (
			<div className="address-view__fields-static">
				{ name && <p className="address-view__address-name">{ name }</p> }
				{ this.renderStreetAddress( this.props.address ) }
				{ this.renderCityAddress( this.props.address ) }
				{ countryName && <p>{ countryName }</p> }
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
