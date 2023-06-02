import {
	tryToGuessPostalCodeFormat,
	getCountryPostalCodeSupport,
	getCountryTaxRequirements,
	CountryListItem,
} from '@automattic/wpcom-checkout';
import debugFactory from 'debug';
import { localize, LocalizeProps } from 'i18n-calypso';
import { camelCase, deburr } from 'lodash';
import { Component, createElement } from 'react';
import { connect } from 'react-redux';
import QueryDomainCountries from 'calypso/components/data/query-countries/domains';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormPhoneMediaInput from 'calypso/components/forms/form-phone-media-input';
import { countries } from 'calypso/components/phone-input/data';
import { toIcannFormat } from 'calypso/components/phone-input/phone-number';
import {
	prepareDomainContactDetails,
	convertDomainContactDetailsToManagedContactDetails,
} from 'calypso/my-sites/checkout/composite-checkout/types/wpcom-store-state';
import { CountrySelect, Input, HiddenInput } from 'calypso/my-sites/domains/components/form';
import { getCountryStates } from 'calypso/state/country-states/selectors';
import getCountries from 'calypso/state/selectors/get-countries';
import {
	CONTACT_DETAILS_FORM_FIELDS,
	CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES,
	CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES,
} from './custom-form-fieldsets/constants';
import RegionAddressFieldsets from './custom-form-fieldsets/region-address-fieldsets';
import { GSuiteFields } from './g-suite-fields';
import type { DomainContactDetails as DomainContactDetailsData } from '@automattic/shopping-cart';
import type { DomainContactDetailsErrors } from '@automattic/wpcom-checkout';
import type { IAppState } from 'calypso/state/types';
import type { ComponentType, FunctionComponent } from 'react';

import './style.scss';

const debug = debugFactory( 'calypso:managed-contact-details-form-fields' );

export interface ManagedContactDetailsFormFieldsProps {
	eventFormName: string;
	contactDetails: DomainContactDetailsData;
	contactDetailsErrors: DomainContactDetailsErrors;
	onContactDetailsChange: ( details: DomainContactDetailsData ) => void;
	getIsFieldDisabled: ( field: string ) => boolean;
	userCountryCode?: string;
	needsOnlyGoogleAppsDetails?: boolean;
	needsAlternateEmailForGSuite?: boolean;
	emailOnly?: boolean;
	isLoggedOutCart?: boolean;
}

export interface ManagedContactDetailsFormFieldsConnectedProps {
	countryCode: string | undefined;
	hasCountryStates: boolean;
	countriesList: CountryListItem[] | null;
}

interface ManagedContactDetailsFormFieldsState {
	phoneCountryCode: string | undefined;
}

export class ManagedContactDetailsFormFields extends Component<
	ManagedContactDetailsFormFieldsProps &
		ManagedContactDetailsFormFieldsConnectedProps &
		LocalizeProps,
	ManagedContactDetailsFormFieldsState
> {
	static defaultProps = {
		eventFormName: 'Domain contact details form',
		contactDetails: Object.fromEntries(
			CONTACT_DETAILS_FORM_FIELDS.map( ( field ) => [ field, '' ] )
		),
		getIsFieldDisabled: ( field: string ) => false,
		onContactDetailsChange: () => undefined,
		hasCountryStates: false,
		userCountryCode: 'US',
	};

	constructor(
		props: ManagedContactDetailsFormFieldsProps &
			ManagedContactDetailsFormFieldsConnectedProps &
			LocalizeProps
	) {
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

	handleFieldChangeEvent = ( event: { target: { name: string; value: string } } ): void => {
		const { name, value } = event.target;
		this.handleFieldChange( name, value );
	};

	handleFieldChange = ( name: string, value: string ): void => {
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

	handlePhoneChange = ( {
		phoneNumber,
		countryCode,
	}: {
		phoneNumber: string;
		countryCode: string;
	} ): void => {
		let form = getFormFromContactDetails(
			this.props.contactDetails,
			this.props.contactDetailsErrors
		);
		let phoneCountryCode = this.state.phoneCountryCode;

		if ( countries[ countryCode ] ) {
			phoneCountryCode = countryCode;
			this.setState( { phoneCountryCode } );
		}

		form = updateFormWithContactChange( form, 'phone', phoneNumber );
		this.updateParentState( form, phoneCountryCode );
	};

	getFieldProps = ( name: string, { customErrorMessage = null } ) => {
		const { eventFormName, getIsFieldDisabled } = this.props;
		const form = getFormFromContactDetails(
			this.props.contactDetails,
			this.props.contactDetailsErrors
		);
		const camelName = camelCase( name );

		const basicValue = form[ camelName ]?.value ?? '';
		let value = basicValue;
		if ( name === 'phone' ) {
			value = { phoneNumber: basicValue, countryCode: this.state.phoneCountryCode };
		}

		return {
			labelClass: 'contact-details-form-fields__label',
			additionalClasses: 'contact-details-form-fields__field',
			disabled: getIsFieldDisabled( name ),
			isError: !! form[ camelName ]?.errors?.length,
			errorMessage: customErrorMessage || getFirstError( form[ camelName ] ),
			onChange: this.handleFieldChangeEvent,
			onBlur: this.handleBlur( name ),
			value,
			name,
			eventFormName,
		};
	};

	// We must use this trick (the extra comma) to convince the TS compiler that this is a generic.
	createField = < P, >(
		name: string,
		componentClass: ComponentType | FunctionComponent< P >,
		// TODO: get a better type for this
		additionalProps: any,
		fieldPropOptions = {}
	) => {
		return createElement( componentClass, {
			...this.getFieldProps( name, fieldPropOptions ),
			...additionalProps,
		} );
	};

	handleBlur = ( name: string ) => () => {
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

		// Strip leading and trailing whitespace
		const sanitizedValue = deburr( form[ camelCase( name ) ]?.value.trim() );
		this.handleFieldChange( name, sanitizedValue );
	};

	createEmailField( description?: string ) {
		const { translate } = this.props;

		return this.createField(
			'email',
			Input,
			{
				label: translate( 'Email' ),
				description,
			},
			{
				customErrorMessage: this.props.contactDetailsErrors?.email,
			}
		);
	}

	renderContactDetailsEmail() {
		return (
			<div className="contact-details-form-fields__contact-details">
				{ this.createEmailField() }
			</div>
		);
	}

	renderContactDetailsEmailPhone() {
		const { translate, isLoggedOutCart } = this.props;

		if ( isLoggedOutCart ) {
			return (
				<>
					<div className="contact-details-form-fields__row">
						{ this.createEmailField(
							translate( "You'll use this email address to access your account later" )
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
					{ this.createEmailField() }

					{ this.createField(
						'phone',
						FormPhoneMediaInput,
						{
							label: translate( 'Phone' ),
							onChange: this.handlePhoneChange,
							countriesList: this.props.countriesList,
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

	getCountryPostalCodeSupport = ( countryCode ) =>
		this.props.countriesList?.length && countryCode
			? getCountryPostalCodeSupport( this.props.countriesList, countryCode )
			: false;

	renderContactDetailsFields() {
		const { translate, hasCountryStates, countriesList } = this.props;
		const form = getFormFromContactDetails(
			this.props.contactDetails,
			this.props.contactDetailsErrors
		);
		const countryCode = form.countryCode?.value ?? '';
		const arePostalCodesSupported = this.getCountryPostalCodeSupport( countryCode );
		const taxRequirements =
			countriesList.length && countryCode
				? getCountryTaxRequirements( countriesList, countryCode )
				: {};
		const isOrganizationFieldRequired =
			taxRequirements.organization ||
			[
				'CCO',
				'GOV',
				'EDU',
				'ASS',
				'HOP',
				'PRT',
				'TDM',
				'TRD',
				'PLT',
				'LAM',
				'TRS',
				'INB',
				'OMK',
				'MAJ',
			].includes( form.extra?.value?.ca?.legalType );

		return (
			<div className="contact-details-form-fields__contact-details">
				<div className="contact-details-form-fields__row">
					{ this.createField(
						'organization',
						HiddenInput,
						{
							label: translate( 'Organization' ),
							text: translate( '+ Add organization name' ),
							toggled: form.organization?.value || isOrganizationFieldRequired,
						},
						{
							customErrorMessage: this.props.contactDetailsErrors?.organization,
						}
					) }
				</div>

				{ this.renderContactDetailsEmailPhone() }

				{ countryCode && (
					<RegionAddressFieldsets
						arePostalCodesSupported={ arePostalCodesSupported }
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
		return (
			<div className="contact-details-form-fields__row">
				<Input
					label={ this.props.translate( 'Alternate email address' ) }
					{ ...this.getFieldProps( 'email', {
						customErrorMessage: this.props.contactDetailsErrors?.email,
					} ) }
				/>
			</div>
		);
	}

	renderFullForm() {
		const { translate, contactDetailsErrors } = this.props;
		const form = getFormFromContactDetails(
			this.props.contactDetails,
			this.props.contactDetailsErrors
		);
		debug( 'rendering with form', form );

		return (
			<>
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

				{ this.props.needsOnlyGoogleAppsDetails
					? this.renderGoogleAppsDetails()
					: this.renderContactDetailsFields() }

				{ this.props.children && (
					<div className="contact-details-form-fields__extra-fields">{ this.props.children }</div>
				) }
			</>
		);
	}

	renderGoogleAppsDetails = () => {
		// Convert this.props.contactDetails (DomainContactDetails) back into
		// ManagedContactDetails, originally changed by
		// `prepareDomainContactDetails()` back up in ContactDetailsContainer.
		const managedContactInfo = convertDomainContactDetailsToManagedContactDetails(
			this.props.contactDetails,
			this.props.contactDetailsErrors
		);

		// Convert the ManagedContactDetails back to DomainContactDetails for the update.
		const onChange = ( updatedManagedContactInfo ) => {
			this.props.onContactDetailsChange( prepareDomainContactDetails( updatedManagedContactInfo ) );
		};

		return (
			<GSuiteFields
				taxInfo={ managedContactInfo }
				countriesList={ this.props.countriesList }
				onChange={ onChange }
				isDisabled={ this.props.getIsFieldDisabled( 'country-code' ) }
			/>
		);
	};

	render() {
		const { emailOnly } = this.props;

		return (
			<FormFieldset className="contact-details-form-fields">
				{ emailOnly && this.renderContactDetailsEmail() }
				{ ! emailOnly && this.renderFullForm() }
				<QueryDomainCountries />
			</FormFieldset>
		);
	}
}

export default connect( ( state: IAppState, props: ManagedContactDetailsFormFieldsProps ) => {
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

function getFirstError( formData ) {
	if ( ! formData?.errors?.length ) {
		return '';
	}
	return formData.errors[ 0 ];
}
