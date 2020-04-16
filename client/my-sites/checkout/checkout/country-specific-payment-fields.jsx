/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { find, isEmpty, includes, get } from 'lodash';

/**
 * Internal dependencies
 */
import FormPhoneMediaInput from 'components/forms/form-phone-media-input';
import { StateSelect, Input, HiddenInput } from 'my-sites/domains/components/form';
import { PAYMENT_PROCESSOR_COUNTRIES_FIELDS } from 'lib/checkout/constants';
import InfoPopover from 'components/info-popover';
import { paymentMethodName } from 'lib/cart-values';

export class CountrySpecificPaymentFields extends Component {
	static propTypes = {
		countryCode: PropTypes.string.isRequired,
		countriesList: PropTypes.array.isRequired,
		getErrorMessage: PropTypes.func.isRequired,
		getFieldValue: PropTypes.func.isRequired,
		handleFieldChange: PropTypes.func.isRequired,
		fieldClassName: PropTypes.string,
		disableFields: PropTypes.bool,
	};

	static defaultProps = {
		fieldClassName: '',
		disableFields: false,
	};

	constructor( props ) {
		super( props );
		this.state = {
			userSelectedPhoneCountryCode: '',
			fields: get( PAYMENT_PROCESSOR_COUNTRIES_FIELDS[ props.countryCode ], 'fields', null ),
		};
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.countryCode !== this.props.countryCode ) {
			this.setFieldsState( this.props.countryCode );
		}
	}

	setFieldsState( countryCode ) {
		this.setState( {
			fields: get( PAYMENT_PROCESSOR_COUNTRIES_FIELDS[ countryCode ], 'fields', null ),
		} );
	}

	createField = ( fieldName, componentClass, props ) => {
		const errorMessage = this.props.getErrorMessage( fieldName ) || [];
		const isError = ! isEmpty( errorMessage );
		const fieldProps = Object.assign(
			{},
			{
				additionalClasses: `checkout__checkout-field ${ this.props.fieldClassName }`,
				isError,
				errorMessage: errorMessage[ 0 ],
				name: fieldName,
				onBlur: this.onFieldChange,
				onChange: this.onFieldChange,
				value: this.props.getFieldValue( fieldName ) || '',
				autoComplete: 'off',
				labelClass: 'checkout__form-label',
				disabled: this.props.disableFields,
			},
			props
		);

		return includes( this.state.fields, fieldName )
			? React.createElement( componentClass, fieldProps )
			: null;
	};

	handlePhoneFieldChange = ( { value, countryCode } ) => {
		this.props.handleFieldChange( 'phone-number', value );
		this.setState( { userSelectedPhoneCountryCode: countryCode } );
	};

	getPanNumberPopover = () => {
		const { translate } = this.props;
		const popoverText = translate( 'Paying with %(indiaPaymentMethods)s requires a PAN number.', {
			comment: 'indiaPaymentMethods are local payment methods in India.',
			args: {
				indiaPaymentMethods: paymentMethodName( 'netbanking' ),
			},
		} );
		return (
			<InfoPopover position="right" className="checkout__pan-number-popover">
				{ popoverText }
			</InfoPopover>
		);
	};

	onFieldChange = event => this.props.handleFieldChange( event.target.name, event.target.value );

	render() {
		const { translate, countriesList, countryCode } = this.props;
		const { userSelectedPhoneCountryCode } = this.state;
		const countryData = find( countriesList, { code: countryCode } );
		const countryName = countryData && countryData.name ? countryData.name : '';
		const containerClassName = classNames(
			'checkout__country-payment-fields',
			`checkout__country-${ countryCode.toLowerCase() }`
		);

		return (
			<div className={ containerClassName }>
				<span key="country-required-fields" className="checkout__form-info-text">
					{ countryName &&
						translate( 'The following fields are also required for payments in %(countryName)s', {
							args: {
								countryName,
							},
						} ) }
				</span>

				{ this.createField( 'document', Input, {
					label: translate( 'Taxpayer Identification Number', {
						comment:
							'Individual taxpayer registry identification required ' +
							'for Brazilian payment methods on credit card form',
					} ),
				} ) }

				{ this.createField( 'nik', Input, {
					label: translate( 'NIK - Indonesia Identity Card Number', {
						comment:
							'NIK - Indonesia Identity Card Number required for Indonesian payment methods.',
					} ),
				} ) }

				{ this.createField( 'pan', Input, {
					placeholder: ' ',
					label: translate( 'PAN Number {{panNumberPopover/}}', {
						comment: 'India PAN number ',
						components: {
							panNumberPopover: this.getPanNumberPopover(),
						},
					} ),
				} ) }

				{ this.createField( 'gstin', Input, {
					placeholder: ' ',
					label: translate( 'GSTIN (optional)', {
						comment: 'India PAN number ',
					} ),
				} ) }

				{ this.createField( 'phone-number', FormPhoneMediaInput, {
					onChange: this.handlePhoneFieldChange,
					countriesList,
					// If the user has manually selected a country for the phone
					// number, use that, but otherwise default this to the same
					// country as the billing address.
					countryCode: userSelectedPhoneCountryCode || countryCode,
					label: translate( 'Phone' ),
				} ) }

				{ this.createField( 'address-1', Input, {
					maxLength: 40,
					label: translate( 'Address' ),
				} ) }

				{ this.createField( 'street-number', Input, {
					inputMode: 'numeric',
					label: translate( 'Street Number', {
						comment: 'Street number associated with address on credit card form',
					} ),
				} ) }

				{ this.createField( 'address-2', HiddenInput, {
					maxLength: 40,
					label: translate( 'Address Line 2' ),
					text: translate( '+ Add Address Line 2' ),
				} ) }

				{ this.createField( 'city', Input, {
					label: translate( 'City' ),
				} ) }

				<div className="checkout__form-state-field">
					{ this.createField( 'state', StateSelect, {
						countryCode,
						label: translate( 'State' ),
					} ) }
				</div>

				{ this.createField( 'postal-code', Input, {
					label: translate( 'Postal Code' ),
				} ) }
			</div>
		);
	}
}

export default localize( CountrySpecificPaymentFields );
