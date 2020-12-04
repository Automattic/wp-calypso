/**
 * External dependencies
 *
 */
import PropTypes from 'prop-types';
import React, { Component, createElement } from 'react';
import { connect } from 'react-redux';
import { camelCase } from 'lodash';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { getCountryStates } from 'calypso/state/country-states/selectors';
import { CountrySelect, Input, HiddenInput } from 'calypso/my-sites/domains/components/form';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormPhoneMediaInput from 'calypso/components/forms/form-phone-media-input';
import { countries } from 'calypso/components/phone-input/data';
import { toIcannFormat } from 'calypso/components/phone-input/phone-number';
import RegionAddressFieldsets from './custom-form-fieldsets/region-address-fieldsets';
import getCountries from 'calypso/state/selectors/get-countries';
import QueryDomainCountries from 'calypso/components/data/query-countries/domains';
import {
	CONTACT_DETAILS_FORM_FIELDS,
	CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES,
	CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES,
} from './custom-form-fieldsets/constants';
import { getPostCodeLabelText } from './custom-form-fieldsets/utils';
import { tryToGuessPostalCodeFormat } from 'calypso/lib/postal-code';

/**
 * Style dependencies
 */
import './style.scss';

const debug = debugFactory( 'calypso:managed-contact-details-form-fields' );

/* eslint-disable wpcalypso/jsx-classname-namespace */

export class ManagedContactDetailsFormFields extends Component {
	static propTypes = {
		eventFormName: PropTypes.string,
		contactDetails: PropTypes.shape(
			Object.assign(
				{},
				...CONTACT_DETAILS_FORM_FIELDS.map( ( field ) => ( { [ field ]: PropTypes.string } ) )
			)
		).isRequired,
		contactDetailsErrors: PropTypes.shape(
			Object.assign(
				{},
				...CONTACT_DETAILS_FORM_FIELDS.map( ( field ) => ( { [ field ]: PropTypes.string } ) )
			)
		),
		countriesList: PropTypes.array.isRequired,
		onContactDetailsChange: PropTypes.func.isRequired,
		getIsFieldDisabled: PropTypes.func,
		userCountryCode: PropTypes.string,
		needsOnlyGoogleAppsDetails: PropTypes.bool,
		needsAlternateEmailForGSuite: PropTypes.bool,
		hasCountryStates: PropTypes.bool,
		translate: PropTypes.func,
	};

	static defaultProps = {
		eventFormName: 'Domain contact details form',
		contactDetails: Object.assign(
			{},
			...CONTACT_DETAILS_FORM_FIELDS.map( ( field ) => ( { [ field ]: '' } ) )
		),
		getIsFieldDisabled: () => {},
		onContactDetailsChange: () => {},
		needsOnlyGoogleAppsDetails: false,
		needsAlternateEmailForGSuite: false,
		hasCountryStates: false,
		translate: ( x ) => x,
		userCountryCode: 'US',
	};

	constructor( props ) {
		super( props );
		this.state = {
			phoneCountryCode: this.props.countryCode || this.props.userCountryCode,
		};
	}

	updateParentState = ( form, phoneCountryCode ) => {
		debug( 'setting parent state with', form );
		this.props.onContactDetailsChange(
			getMainFieldValues(
				form,
				this.props.countryCode,
				phoneCountryCode,
				this.props.hasCountryStates
			)
		);
	};

	handleFieldChangeEvent = ( event ) => {
		const { name, value } = event.target;
		this.handleFieldChange( name, value );
	};

	handleFieldChange = ( name, value ) => {
		let form = getFormFromContactDetails(
			this.props.contactDetails,
			this.props.contactDetailsErrors
		);
		let phoneCountryCode = this.state.phoneCountryCode;

		if ( name === 'country-code' && value && ! form.phone?.value ) {
			phoneCountryCode = value;
			this.setState( { phoneCountryCode } );
		}

		form = updateFormWithContactChange( form, name, value );

		this.updateParentState( form, phoneCountryCode );
	};

	handlePhoneChange = ( { value, countryCode } ) => {
		let form = getFormFromContactDetails(
			this.props.contactDetails,
			this.props.contactDetailsErrors
		);
		let phoneCountryCode = this.state.phoneCountryCode;

		if ( countries[ countryCode ] ) {
			phoneCountryCode = countryCode;
			this.setState( { phoneCountryCode } );
		}

		form = updateFormWithContactChange( form, 'phone', value );
		this.updateParentState( form, phoneCountryCode );
		return;
	};

	getFieldProps = ( name, { customErrorMessage = null } ) => {
		const { eventFormName, getIsFieldDisabled } = this.props;
		const form = getFormFromContactDetails(
			this.props.contactDetails,
			this.props.contactDetailsErrors
		);
		const camelName = camelCase( name );

		return {
			labelClass: 'contact-details-form-fields__label',
			additionalClasses: 'contact-details-form-fields__field',
			disabled: getIsFieldDisabled( name ),
			isError: !! form[ camelName ]?.errors?.length,
			errorMessage: customErrorMessage || getFirstError( form[ camelName ] ),
			onChange: this.handleFieldChangeEvent,
			onBlur: this.handleBlur,
			value: form[ camelName ]?.value ?? '',
			name,
			eventFormName,
		};
	};

	createField = ( name, componentClass, additionalProps, fieldPropOptions = {} ) => {
		return createElement( componentClass, {
			...this.getFieldProps( name, fieldPropOptions ),
			...additionalProps,
		} );
	};

	handleBlur = () => {
		const form = getFormFromContactDetails(
			this.props.contactDetails,
			this.props.contactDetailsErrors
		);

		CONTACT_DETAILS_FORM_FIELDS.forEach( ( fieldName ) => {
			if ( fieldName === 'postalCode' ) {
				debug( 'reformatting postal code', form.postalCode?.value );
				const formattedPostalCode = tryToGuessPostalCodeFormat(
					form.postalCode?.value.toUpperCase?.() ?? '',
					form.countryCode?.value
				);
				this.handleFieldChange( 'postal-code', formattedPostalCode );
			}
		} );
	};

	renderContactDetailsEmailPhone() {
		const { translate, isLoggedOutCart } = this.props;

		if ( isLoggedOutCart ) {
			return (
				<>
					<div className="contact-details-form-fields__row">
						{ this.createField(
							'email',
							Input,
							{
								label: translate( 'Email' ),
								description: translate(
									"You'll use this email address to access your account later"
								),
							},
							{
								customErrorMessage: this.props.contactDetailsErrors?.email,
							}
						) }
					</div>

					<div className="contact-details-form-fields__row">
						{ this.createField(
							'country-code',
							CountrySelect,
							{
								label: translate( 'Country' ),
								countriesList: this.props.countriesList,
							},
							{
								customErrorMessage: this.props.contactDetailsErrors?.countryCode,
							}
						) }
						{ this.createField(
							'phone',
							FormPhoneMediaInput,
							{
								label: translate( 'Phone' ),
								onChange: this.handlePhoneChange,
								countriesList: this.props.countriesList,
								countryCode: this.state.phoneCountryCode,
								enableStickyCountry: false,
							},
							{
								customErrorMessage: this.props.contactDetailsErrors?.phone,
							}
						) }
					</div>
				</>
			);
		}

		return (
			<>
				<div className="contact-details-form-fields__row">
					{ this.createField(
						'email',
						Input,
						{
							label: translate( 'Email' ),
						},
						{
							customErrorMessage: this.props.contactDetailsErrors?.email,
						}
					) }

					{ this.createField(
						'phone',
						FormPhoneMediaInput,
						{
							label: translate( 'Phone' ),
							onChange: this.handlePhoneChange,
							countriesList: this.props.countriesList,
							countryCode: this.state.phoneCountryCode,
							enableStickyCountry: false,
						},
						{
							customErrorMessage: this.props.contactDetailsErrors?.phone,
						}
					) }
				</div>

				<div className="contact-details-form-fields__row">
					{ this.createField(
						'country-code',
						CountrySelect,
						{
							label: translate( 'Country' ),
							countriesList: this.props.countriesList,
						},
						{
							customErrorMessage: this.props.contactDetailsErrors?.countryCode,
						}
					) }
				</div>
			</>
		);
	}

	renderContactDetailsFields() {
		const { translate, hasCountryStates } = this.props;
		const form = getFormFromContactDetails(
			this.props.contactDetails,
			this.props.contactDetailsErrors
		);
		const countryCode = form.countryCode?.value ?? '';

		return (
			<div className="contact-details-form-fields__contact-details">
				<div className="contact-details-form-fields__row">
					{ this.createField(
						'organization',
						HiddenInput,
						{
							label: translate( 'Organization' ),
							text: translate( '+ Add organization name' ),
						},
						{
							customErrorMessage: this.props.contactDetailsErrors?.organization,
						}
					) }
				</div>

				{ this.renderContactDetailsEmailPhone() }

				{ countryCode && (
					<RegionAddressFieldsets
						getFieldProps={ this.getFieldProps }
						countryCode={ countryCode }
						hasCountryStates={ hasCountryStates }
						shouldAutoFocusAddressField={ this.shouldAutoFocusAddressField }
						contactDetailsErrors={ this.props.contactDetailsErrors }
					/>
				) }
			</div>
		);
	}

	renderAlternateEmailFieldForGSuite() {
		const customErrorMessage = this.props.contactDetailsErrors?.alternateEmail;
		return (
			<div className="contact-details-form-fields__row">
				<Input
					label={ this.props.translate( 'Alternate email address' ) }
					{ ...this.getFieldProps( 'alternate-email', {
						customErrorMessage,
					} ) }
				/>
			</div>
		);
	}

	render() {
		const { translate, contactDetailsErrors } = this.props;
		const form = getFormFromContactDetails(
			this.props.contactDetails,
			this.props.contactDetailsErrors
		);
		debug( 'rendering with form', form );

		return (
			<FormFieldset className="contact-details-form-fields">
				<div className="contact-details-form-fields__row">
					{ this.createField(
						'first-name',
						Input,
						{
							label: translate( 'First name' ),
						},
						{
							customErrorMessage: contactDetailsErrors?.firstName,
						}
					) }

					{ this.createField(
						'last-name',
						Input,
						{
							label: translate( 'Last name' ),
						},
						{
							customErrorMessage: contactDetailsErrors?.lastName,
						}
					) }
				</div>
				{ this.props.needsAlternateEmailForGSuite && this.renderAlternateEmailFieldForGSuite() }

				{ this.props.needsOnlyGoogleAppsDetails ? (
					<GSuiteFields
						countryCode={ form.countryCode?.value ?? '' }
						countriesList={ this.props.countriesList }
						contactDetailsErrors={ this.props.contactDetailsErrors }
						getFieldProps={ this.getFieldProps }
						translate={ this.props.translate }
					/>
				) : (
					this.renderContactDetailsFields()
				) }

				{ this.props.children && (
					<div className="contact-details-form-fields__extra-fields">{ this.props.children }</div>
				) }

				<QueryDomainCountries />
			</FormFieldset>
		);
	}
}

export default connect( ( state, props ) => {
	const contactDetails = props.contactDetails;
	const countryCode = contactDetails.countryCode;

	const hasCountryStates = contactDetails?.countryCode
		? !! getCountryStates( state, contactDetails.countryCode )?.length
		: false;
	return {
		countryCode,
		countriesList: getCountries( state, 'domains' ),
		hasCountryStates,
	};
} )( localize( ManagedContactDetailsFormFields ) );

function getFormFromContactDetails( contactDetails, contactDetailsErrors ) {
	return Object.keys( contactDetails ).reduce( ( newForm, key ) => {
		const value = contactDetails[ key ];
		const error = contactDetailsErrors[ key ];
		const errors = error ? [ error ] : [];
		return {
			...newForm,
			[ key ]: {
				value,
				errors,
			},
		};
	}, {} );
}

function updateFormWithContactChange( form, key, value, additionalProperties ) {
	return {
		...form,
		[ camelCase( key ) ]: {
			value,
			errors: [],
			...( additionalProperties ?? {} ),
		},
	};
}

function getMainFieldValues( form, countryCode, phoneCountryCode, hasCountryStates ) {
	const mainFieldValues = Object.keys( form ).reduce( ( values, key ) => {
		return { ...values, [ key ]: form[ key ].value };
	}, {} );
	let state = mainFieldValues.state;

	// domains registered according to ancient validation rules may have state set even though not required
	if (
		! hasCountryStates &&
		( CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES.includes( countryCode ) ||
			CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES.includes( countryCode ) )
	) {
		state = '';
	}

	const fax = '';

	return {
		...mainFieldValues,
		fax,
		state,
		phone: mainFieldValues.phone
			? toIcannFormat( mainFieldValues.phone, countries[ phoneCountryCode ] )
			: '',
	};
}

function GSuiteFields( {
	countryCode,
	countriesList,
	contactDetailsErrors,
	getFieldProps,
	translate,
} ) {
	return (
		<div className="contact-details-form-fields__row g-apps-fieldset">
			<CountrySelect
				label={ translate( 'Country' ) }
				countriesList={ countriesList }
				{ ...getFieldProps( 'country-code', {
					customErrorMessage: contactDetailsErrors?.countryCode,
				} ) }
			/>

			<Input
				label={ getPostCodeLabelText( countryCode ) }
				{ ...getFieldProps( 'postal-code', {
					customErrorMessage: contactDetailsErrors?.postalCode,
				} ) }
			/>
		</div>
	);
}

function getFirstError( formData ) {
	if ( ! formData?.errors?.length ) {
		return '';
	}
	return formData.errors[ 0 ];
}
