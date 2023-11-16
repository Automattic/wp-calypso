import {
	tryToGuessPostalCodeFormat,
	getCountryPostalCodeSupport,
	getCountryTaxRequirements,
	CountryListItem,
} from '@automattic/wpcom-checkout';
import debugFactory from 'debug';
import { localize, LocalizeProps } from 'i18n-calypso';
import { camelCase, deburr } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryDomainCountries from 'calypso/components/data/query-countries/domains';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormPhoneMediaInput from 'calypso/components/forms/form-phone-media-input';
import { countries } from 'calypso/components/phone-input/data';
import { toIcannFormat } from 'calypso/components/phone-input/phone-number';
import CountrySelectMenu from 'calypso/my-sites/checkout/src/components/country-select-menu';
import {
	prepareDomainContactDetails,
	convertDomainContactDetailsToManagedContactDetails,
} from 'calypso/my-sites/checkout/src/types/wpcom-store-state';
import { Input, HiddenInput } from 'calypso/my-sites/domains/components/form';
import { getCountryStates } from 'calypso/state/country-states/selectors';
import {
	getCurrentUserEmail,
	isCurrentUserEmailVerified,
} from 'calypso/state/current-user/selectors';
import getCountries from 'calypso/state/selectors/get-countries';
import {
	CONTACT_DETAILS_FORM_FIELDS,
	CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES,
	CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES,
} from './custom-form-fieldsets/constants';
import RegionAddressFieldsets from './custom-form-fieldsets/region-address-fieldsets';
import { GSuiteFields } from './g-suite-fields';
import type {
	DomainContactDetails as DomainContactDetailsData,
	DomainContactDetailsExtra,
} from '@automattic/shopping-cart';
import type { DomainContactDetailsErrors, ManagedContactDetails } from '@automattic/wpcom-checkout';
import type { IAppState } from 'calypso/state/types';
import './style.scss';

const debug = debugFactory( 'calypso:managed-contact-details-form-fields' );

export interface FieldProps {
	labelClass: string;
	additionalClasses: string;
	disabled: boolean;
	isError: boolean;
	errorMessage:
		| React.ReactElement
		| string
		| number
		| DomainContactDetailsErrors[ 'extra' ]
		| undefined;
	onChange: ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	onBlur: () => void;
	value: string | DomainContactDetailsExtra | undefined;
	name: string;
	eventFormName: string | undefined;
}

export interface ManagedContactDetailsFormFieldsProps {
	eventFormName?: string;
	contactDetails: DomainContactDetailsData;
	contactDetailsErrors: DomainContactDetailsErrors;
	onContactDetailsChange: ( details: DomainContactDetailsData ) => void;
	getIsFieldDisabled: ( field: string ) => boolean;
	userCountryCode?: string;
	needsOnlyGoogleAppsDetails?: boolean;
	needsAlternateEmailForGSuite?: boolean;
	emailOnly?: boolean;
	isLoggedOutCart?: boolean;
	children?: React.ReactNode;
}

export interface ManagedContactDetailsFormFieldsConnectedProps {
	countryCode: string | undefined;
	hasCountryStates: boolean;
	countriesList: CountryListItem[] | null;
	needsEmailVerification: boolean;
	userEmail: string;
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
		getIsFieldDisabled: ( field: string ) => ( field ? false : false ),
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

	updateParentState = ( newData: DomainContactDetailsData ) => {
		this.props.onContactDetailsChange(
			formatDataForParent( {
				data: newData,
				phoneCountryCode: this.state.phoneCountryCode,
				countryCode: this.props.countryCode,
				hasCountryStates: this.props.hasCountryStates,
			} )
		);
	};

	handleFieldChangeEvent = ( event: React.ChangeEvent< HTMLInputElement > ): void => {
		const { name, value } = event.target;
		this.handleFieldChange( name, value );
	};

	handleFieldChange = ( name: string, value: string ): void => {
		if ( name === 'country-code' && value && ! this.props.contactDetails.phone ) {
			this.setState( { phoneCountryCode: value }, () => {
				// We have to wait for the phoneCountryCode to be updated because it is
				// used by updateParentState.
				const updatedParentState: DomainContactDetailsData = {
					...this.props.contactDetails,
					[ camelCase( name ) ]: value,
				};
				this.updateParentState( updatedParentState );
			} );
			return;
		}

		const updatedParentState: DomainContactDetailsData = {
			...this.props.contactDetails,
			[ camelCase( name ) ]: value,
		};
		this.updateParentState( updatedParentState );
	};

	handlePhoneChange = ( {
		phoneNumber,
		countryCode,
	}: {
		phoneNumber: string;
		countryCode: string;
	} ): void => {
		let phoneCountryCode = this.state.phoneCountryCode;

		if ( countries[ countryCode as keyof typeof countries ] ) {
			phoneCountryCode = countryCode;
			this.setState( { phoneCountryCode }, () => {
				// We have to wait for the phoneCountryCode to be updated because it is
				// used by updateParentState.
				const updatedParentState: DomainContactDetailsData = {
					...this.props.contactDetails,
					phone: phoneNumber,
				};
				this.updateParentState( updatedParentState );
			} );
			return;
		}

		const updatedParentState: DomainContactDetailsData = {
			...this.props.contactDetails,
			phone: phoneNumber,
		};
		this.updateParentState( updatedParentState );
	};

	getFieldProps = (
		name: string,
		{ customErrorMessage }: { customErrorMessage?: DomainContactDetailsErrors[ 'firstName' ] }
	) => {
		const { eventFormName, getIsFieldDisabled } = this.props;
		const camelName = camelCase( name );

		const value = this.props.contactDetails[ camelName as keyof DomainContactDetailsData ];

		return {
			labelClass: 'contact-details-form-fields__label',
			additionalClasses: 'contact-details-form-fields__field',
			disabled: getIsFieldDisabled( name ),
			isError: !! this.props.contactDetailsErrors[ camelName as keyof DomainContactDetailsErrors ],
			errorMessage:
				customErrorMessage ||
				this.props.contactDetailsErrors[ camelName as keyof DomainContactDetailsErrors ],
			onChange: this.handleFieldChangeEvent,
			onBlur: this.handleBlur( name ),
			value,
			name,
			eventFormName,
		};
	};

	handleBlur = ( name: string ) => () => {
		CONTACT_DETAILS_FORM_FIELDS.forEach( ( fieldName ) => {
			if ( fieldName === 'postalCode' ) {
				debug( 'reformatting postal code', this.props.contactDetails.postalCode );
				const formattedPostalCode = tryToGuessPostalCodeFormat(
					this.props.contactDetails.postalCode?.toUpperCase() ?? '',
					this.props.contactDetails.countryCode
				);
				this.handleFieldChange( 'postal-code', formattedPostalCode );
			}
		} );

		// Strip leading and trailing whitespace
		const updatedValue =
			this.props.contactDetails[ camelCase( name ) as keyof DomainContactDetailsData ];
		const sanitizedValue = deburr( typeof updatedValue === 'string' ? updatedValue.trim() : '' );
		this.handleFieldChange( name, sanitizedValue );
	};

	maybeDisplayEmailVerificationNotice = () => {
		if (
			this.props.contactDetails.email !== this.props.userEmail ||
			this.props.needsEmailVerification ||
			this.props.isLoggedOutCart
		) {
			return this.props.translate( 'Remember to confirm your email address' );
		}
	};

	createEmailField() {
		return (
			<Input
				label={ this.props.translate( 'Email' ) }
				description={ this.maybeDisplayEmailVerificationNotice() }
				labelClass="contact-details-form-fields__label"
				additionalClasses="contact-details-form-fields__field"
				disabled={ this.props.getIsFieldDisabled( 'email' ) }
				isError={ !! this.props.contactDetailsErrors.email }
				errorMessage={ this.props.contactDetailsErrors.email }
				onChange={ this.handleFieldChangeEvent }
				onBlur={ this.handleBlur( 'email' ) }
				value={ this.props.contactDetails.email }
				name="email"
				eventFormName={ this.props.eventFormName }
			/>
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
		if ( ! this.props.countriesList ) {
			return null;
		}

		return (
			<>
				<div className="contact-details-form-fields__row">
					{ this.createEmailField() }
					<FormPhoneMediaInput
						label={ this.props.translate( 'Phone' ) }
						name="phone"
						value={ {
							phoneNumber: this.props.contactDetails.phone ?? '',
							countryCode:
								this.state.phoneCountryCode ??
								this.props.contactDetails.countryCode ??
								this.props.countryCode ??
								'',
						} }
						disabled={ this.props.getIsFieldDisabled( 'phone' ) }
						errorMessage={ this.props.contactDetailsErrors.phone }
						isError={ !! this.props.contactDetailsErrors.phone }
						onChange={ this.handlePhoneChange }
						countriesList={ this.props.countriesList }
						additionalClasses="contact-details-form-fields__field"
					/>
				</div>

				<div className="contact-details-form-fields__row">
					<div className="contact-details-form-fields__country">
						<CountrySelectMenu
							countriesList={ this.props.countriesList }
							errorMessage={ this.props.contactDetailsErrors.countryCode }
							isDisabled={ this.props.getIsFieldDisabled( 'country-code' ) }
							isError={ !! this.props.contactDetailsErrors.countryCode }
							onChange={ ( event ) => {
								this.handleFieldChange( 'country-code', event.currentTarget.value );
							} }
							currentValue={ this.props.contactDetails.countryCode }
						/>
					</div>
				</div>
			</>
		);
	}

	getCountryPostalCodeSupport = ( countryCode: string ) =>
		this.props.countriesList?.length && countryCode
			? getCountryPostalCodeSupport( this.props.countriesList, countryCode )
			: false;

	renderContactDetailsFields() {
		const { translate, hasCountryStates, countriesList } = this.props;
		const countryCode = this.props.contactDetails.countryCode ?? '';
		const arePostalCodesSupported = this.getCountryPostalCodeSupport( countryCode );
		const taxRequirements =
			countriesList?.length && countryCode
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
			].includes( this.props.contactDetails.extra?.ca?.legalType ?? '' );

		return (
			<div className="contact-details-form-fields__contact-details">
				<div className="contact-details-form-fields__row">
					<HiddenInput
						label={ this.props.translate( 'Organization' ) }
						labelClass="contact-details-form-fields__label"
						additionalClasses="contact-details-form-fields__field"
						disabled={ this.props.getIsFieldDisabled( 'organization' ) }
						isError={ !! this.props.contactDetailsErrors.organization }
						errorMessage={ this.props.contactDetailsErrors.organization }
						onChange={ this.handleFieldChangeEvent }
						onBlur={ this.handleBlur( 'organization' ) }
						value={ this.props.contactDetails.organization }
						name="organization"
						text={ translate( '+ Add organization name' ) }
						toggled={ this.props.contactDetails.organization || isOrganizationFieldRequired }
					/>
				</div>

				{ this.renderContactDetailsEmailPhone() }

				{ countryCode && (
					<RegionAddressFieldsets
						arePostalCodesSupported={ arePostalCodesSupported }
						getFieldProps={ this.getFieldProps }
						countryCode={ countryCode }
						hasCountryStates={ hasCountryStates }
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
					description={
						this.props.isLoggedOutCart
							? this.props.translate( "You'll use this email address to access your account later" )
							: undefined
					}
					labelClass="contact-details-form-fields__label"
					additionalClasses="contact-details-form-fields__field"
					disabled={ this.props.getIsFieldDisabled( 'email' ) }
					isError={ !! this.props.contactDetailsErrors.email }
					errorMessage={ this.props.contactDetailsErrors.email }
					onChange={ this.handleFieldChangeEvent }
					onBlur={ this.handleBlur( 'email' ) }
					value={ this.props.contactDetails.email }
					name="email"
					eventFormName={ this.props.eventFormName }
				/>
			</div>
		);
	}

	renderFullForm() {
		return (
			<>
				<div className="contact-details-form-fields__row">
					<Input
						label={ this.props.translate( 'First name' ) }
						labelClass="contact-details-form-fields__label"
						additionalClasses="contact-details-form-fields__field"
						disabled={ this.props.getIsFieldDisabled( 'first-name' ) }
						isError={ !! this.props.contactDetailsErrors.firstName }
						errorMessage={ this.props.contactDetailsErrors.firstName }
						onChange={ this.handleFieldChangeEvent }
						onBlur={ this.handleBlur( 'first-name' ) }
						value={ this.props.contactDetails.firstName }
						name="first-name"
						eventFormName={ this.props.eventFormName }
					/>
					<Input
						label={ this.props.translate( 'Last name' ) }
						labelClass="contact-details-form-fields__label"
						additionalClasses="contact-details-form-fields__field"
						disabled={ this.props.getIsFieldDisabled( 'last-name' ) }
						isError={ !! this.props.contactDetailsErrors.lastName }
						errorMessage={ this.props.contactDetailsErrors.lastName }
						onChange={ this.handleFieldChangeEvent }
						onBlur={ this.handleBlur( 'last-name' ) }
						value={ this.props.contactDetails.lastName }
						name="last-name"
						eventFormName={ this.props.eventFormName }
					/>
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
		if ( ! this.props.countriesList ) {
			return null;
		}

		// Convert this.props.contactDetails (DomainContactDetails) back into
		// ManagedContactDetails, originally changed by
		// `prepareDomainContactDetails()` back up in ContactDetailsContainer.
		const managedContactInfo = convertDomainContactDetailsToManagedContactDetails(
			this.props.contactDetails,
			this.props.contactDetailsErrors
		);

		// Convert the ManagedContactDetails back to DomainContactDetails for the update.
		const onChange = ( updatedManagedContactInfo: ManagedContactDetails ) => {
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
		userEmail: getCurrentUserEmail( state ),
		needsEmailVerification: ! isCurrentUserEmailVerified( state ),
	};
} )( localize( ManagedContactDetailsFormFields ) );

function formatDataForParent( {
	data,
	countryCode,
	phoneCountryCode,
	hasCountryStates,
}: {
	data: DomainContactDetailsData;
	countryCode: string | undefined;
	phoneCountryCode: string | undefined;
	hasCountryStates: boolean;
} ): DomainContactDetailsData {
	let state = data.state;

	// domains registered according to ancient validation rules may have state set even though not required
	if (
		! hasCountryStates &&
		countryCode &&
		( CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES.includes( countryCode ) ||
			CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES.includes( countryCode ) )
	) {
		state = '';
	}

	const fax = '';

	return {
		...data,
		fax,
		state,
		phone: data.phone
			? toIcannFormat( data.phone, countries[ phoneCountryCode as keyof typeof countries ] )
			: '',
	};
}
