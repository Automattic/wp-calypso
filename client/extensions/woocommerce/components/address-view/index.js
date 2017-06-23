/**
 * External dependencies
 */
import classNames from 'classnames';
import find from 'lodash/find';
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Countries from 'woocommerce/lib/countries';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';

class AddressView extends Component {
	static propTypes = {
		address: PropTypes.shape( {
			name: PropTypes.string.isRequired,
			street: PropTypes.string.isRequired,
			street2: PropTypes.string,
			city: PropTypes.string.isRequired,
			state: PropTypes.string,
			country: PropTypes.string.isRequired,
			postcode: PropTypes.string,
		} ),
		isEditable: PropTypes.bool,
		nameLabel: PropTypes.string,
		onChange: PropTypes.func,
	};

	static defaultProps = {
		address: {
			name: '',
			street: '',
			street2: '',
			city: '',
			state: '',
			country: 'US',
			postcode: '',
		},
		isEditable: false,
		nameLabel: '',
	}

	renderEditable = () => {
		const { nameLabel, onChange, translate } = this.props;
		const { city, country, name, postcode, street, street2, state } = this.props.address;
		const countryData = find( Countries, { code: country } );
		const foundCountry = Boolean( countryData );
		const states = foundCountry ? countryData.states : [];
		const statesLabel = foundCountry ? countryData.statesLabel : '';

		return (
			<div className="address-view__fields-editable">
				<FormFieldSet>
					<FormLabel>{ nameLabel || translate( 'Business Name' ) }</FormLabel>
					<FormTextInput
						disabled
						name="name"
						onChange={ onChange }
						value={ name }
					/>
				</FormFieldSet>
				<FormFieldSet>
					<FormLabel>{ translate( 'Street address' ) }</FormLabel>
					<FormTextInput
						name="street"
						onChange={ onChange }
						value={ street }
					/>
				</FormFieldSet>
				<FormFieldSet>
					<FormTextInput
						name="street2"
						onChange={ onChange }
						value={ street2 }
					/>
				</FormFieldSet>
				<div className="address-view__editable-city-state-postcode">
					<FormFieldSet>
						<FormLabel>{ translate( 'City' ) }</FormLabel>
						<FormTextInput
							name="city"
							onChange={ onChange }
							value={ city }
						/>
					</FormFieldSet>
					<FormFieldSet>
						<FormLabel>{ statesLabel }</FormLabel>
						<FormSelect
							disabled={ ! foundCountry }
							name="state"
							onChange={ onChange }
							value={ state }
						>
							{ states.map( ( option ) => {
								return (
									<option key={ option.code } value={ option.code }>{ option.name }</option>
								);
							} ) }
						</FormSelect>
					</FormFieldSet>
					<FormFieldSet>
						<FormLabel>{ translate( 'Postal code' ) }</FormLabel>
						<FormTextInput
							name="postcode"
							onChange={ onChange }
							value={ postcode }
						/>
					</FormFieldSet>
				</div>
				<FormFieldSet className="address-view__country">
					<FormLabel>{ translate( 'Country' ) }</FormLabel>
					<FormSelect
						name="country"
						onChange={ onChange }
						value={ country }
					>
						{ Countries.map( ( option ) => {
							return (
								<option key={ option.code } value={ option.code }>{ option.name }</option>
							);
						} ) }
					</FormSelect>
				</FormFieldSet>
			</div>
		);
	}

	renderStatic = () => {
		const { name, street, street2, city, state, postcode, country } = this.props.address;
		return (
			<div className="address-view__fields-static">
				<p className="address-view__address-name">
					{ name }
				</p>
				<p>
					{ street }
				</p>
				{	street2 && <p>{ street2 }</p> }
				<p>
					{ city } { state && { state } } { postcode && { postcode } }
				</p>
				<p>
					{ country }
				</p>
			</div>
		);
	}

	render = () => {
		const { className, isEditable } = this.props;
		const classes = classNames( 'address-view__address', className );

		return (
			<div className={ classes }>
				{ isEditable ? this.renderEditable() : this.renderStatic() }
			</div>
		);
	}
}

export default localize( AddressView );
