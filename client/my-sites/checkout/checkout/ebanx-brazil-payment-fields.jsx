/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { find, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import FormPhoneMediaInput from 'components/forms/form-phone-media-input';
import { StateSelect, Input, HiddenInput } from 'my-sites/domains/components/form';

export class EbanxBrazilPaymentFields extends Component {
	static propTypes = {
		countryCode: PropTypes.string.isRequired,
		countriesList: PropTypes.object.isRequired,
		getErrorMessage: PropTypes.func.isRequired,
		getFieldValue: PropTypes.func.isRequired,
		handleFieldChange: PropTypes.func.isRequired,
		fieldClassName: PropTypes.string,
	};

	static defaultProps = {
		fieldClassName: '',
	};

	state = {
		userSelectedPhoneCountryCode: '',
	};

	createField = ( fieldName, componentClass, props ) => {
		const errorMessage = this.props.getErrorMessage( fieldName ) || [];
		const isError = ! isEmpty( errorMessage );
		return React.createElement(
			componentClass,
			Object.assign(
				{},
				{
					additionalClasses: `checkout__form-field ${ this.props.fieldClassName }`,
					isError,
					errorMessage: errorMessage[ 0 ],
					name: fieldName,
					onBlur: this.onFieldChange,
					onChange: this.onFieldChange,
					value: this.props.getFieldValue( fieldName ),
					autoComplete: 'off',
					labelClass: 'checkout__form-label',
				},
				props
			)
		);
	};

	handlePhoneFieldChange = ( { value, countryCode } ) => {
		this.setState(
			{
				userSelectedPhoneCountryCode: countryCode,
			},
			() => {
				this.props.handleFieldChange( 'phone-number', value );
			}
		);
	};

	onFieldChange = event => {
		this.props.handleFieldChange( event.target.name, event.target.value );
	};

	render() {
		const { translate, countriesList, countryCode } = this.props;
		const { userSelectedPhoneCountryCode } = this.state;
		const countryData = find( countriesList.get(), { code: countryCode } );
		const countryName = countryData && countryData.name ? countryData.name : '';

		let ebanxMessage = '';
		if ( countryName ) {
			ebanxMessage = translate(
				'The following fields are also required for payments in %(countryName)s',
				{
					args: {
						countryName,
					},
				}
			);
		}

		return [
			<span key="ebanx-required-fields" className="checkout__form-info-text">
				{ ebanxMessage }
			</span>,

			this.createField( 'document', Input, {
				label: translate( 'Taxpayer Identification Number', {
					comment:
					'Individual taxpayer registry identification required ' +
					'for Brazilian payment methods on credit card form',
				} ),
				key: 'document',
			} ),

			this.createField( 'phone-number', FormPhoneMediaInput, {
				onChange: this.handlePhoneFieldChange,
				countriesList: countriesList,
				// If the user has manually selected a country for the phone
				// number, use that, but otherwise default this to the same
				// country as the billing address.
				countryCode: userSelectedPhoneCountryCode || countryCode,
				label: translate( 'Phone' ),
				key: 'phone-number',
			} ),

			this.createField( 'address-1', Input, {
				maxLength: 40,
				label: translate( 'Address' ),
				key: 'address-1',
			} ),

			this.createField( 'street-number', Input, {
				inputMode: 'numeric',
				label: translate( 'Street Number', {
					comment: 'Street number associated with address on credit card form',
				} ),
				key: 'street-number',
			} ),

			this.createField( 'address-2', HiddenInput, {
				maxLength: 40,
				label: translate( 'Address Line 2' ),
				text: translate( '+ Add Address Line 2' ),
				key: 'address-2',
			} ),

			this.createField( 'city', Input, {
				label: translate( 'City' ),
				key: 'city',
			} ),

			<div className="checkout__form-state-field" key="state">
				{ this.createField( 'state', StateSelect, {
					countryCode: countryCode,
					label: translate( 'State' ),
				} ) }
			</div>,
		];
	}
}

export default localize( EbanxBrazilPaymentFields );
