/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { useSelect, useDispatch } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { useHasDomainsInCart } from '../hooks/has-domains';
import Field from './field';
import { SummaryLine, SummaryDetails, SummarySpacerLine } from './summary-details';
import { LeftColumn, RightColumn } from './ie-fallback';
import { prepareDomainContactDetails, isValid } from '../types';

export default function WPContactForm( {
	summary,
	isComplete,
	isActive,
	CountrySelectMenu,
	PhoneInput,
	countriesList,
	renderDomainContactFields,
} ) {
	const translate = useTranslate();
	const isDomainFieldsVisible = useHasDomainsInCart();
	const contactInfo = useSelect( select => select( 'wpcom' ).getContactInfo() );
	const setters = useDispatch( 'wpcom' );
	const domainName = 'example.com'; // TODO: get the actual domain name

	if ( summary && isComplete ) {
		return <ContactFormSummary />;
	}
	if ( ! isActive ) {
		return null;
	}

	return (
		<BillingFormFields>
			{ renderContactDetails( {
				translate,
				domainName,
				isDomainFieldsVisible,
				contactInfo,
				renderDomainContactFields,
				setters,
				PhoneInput,
				CountrySelectMenu,
				countriesList,
			} ) }
		</BillingFormFields>
	);
}

const BillingFormFields = styled.div`
	margin-bottom: 16px;
`;

const FormField = styled( Field )`
	margin-top: 16px;
	:first-of-type {
		margin-top: 0;
	}
`;

const GridRow = styled.div`
	display: -ms-grid;
	display: grid;
	width: 100%;
	-ms-grid-columns: 48% 4% 48%;
	grid-template-columns: 48% 48%;
	grid-column-gap: 4%;
	justify-items: stretch;
`;

const FieldRow = styled( GridRow )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function isEligibleForVat( country ) {
	//TODO: Detect whether people are in EU or AU and return true if they are
	const countriesWithVAT = [ 'AU' ];
	return countriesWithVAT.includes( country );
}

// TODO: Figure out if we still need this
function DomainFieldsCheckbox( { toggleVisibility, isDomainContactVisible } ) {
	const translate = useTranslate();
	return (
		<DomainRegistrationCheckBoxWrapper>
			<DomainRegistrationCheckbox
				type="checkbox"
				id="domain-registration"
				name="domain-registration"
				defaultChecked={ ! isDomainContactVisible }
				onChange={ toggleVisibility }
			/>
			<DomainRegistrationLabel htmlFor="domain-registration">
				{ translate(
					'Use your billing details for your domain registration contact information.'
				) }
			</DomainRegistrationLabel>
		</DomainRegistrationCheckBoxWrapper>
	);
}

DomainFieldsCheckbox.propTypes = {
	toggleVisibility: PropTypes.func.isRequired,
};

const DomainRegistrationCheckBoxWrapper = styled.div`
	margin: 16px 0 24px;
	display: flex;
	width: 100%;
`;

const DomainRegistrationLabel = styled.label`
	font-size: 14px;
	color: ${props => props.theme.colors.textColor};
	display: block;
	position: relative;
	padding-left: 5px;

	:hover {
		cursor: pointer;
	}

	:before {
		display: block;
		width: 16px;
		height: 16px;
		content: '';
		position: absolute;
		left: -20px;
		top: 0;
		border: 1px solid ${props => props.theme.colors.borderColorLight};
		border-radius: 3px;
	}
`;

const DomainRegistrationCheckbox = styled.input`
	margin-right: 5px;
	opacity: 0;

	:checked + label:before {
		background: ${props => props.theme.colors.highlight};
	}

	:checked + label:after {
		display: block;
		width: 4px;
		height: 8px;
		content: '';
		position: absolute;
		left: -14px;
		top: 3px;
		border-right: 2px solid ${props => props.theme.colors.surface};
		border-bottom: 2px solid ${props => props.theme.colors.surface};
		transform: rotate( 45deg );
	}

	:focus + label:before {
		outline: ${props => props.theme.colors.outline} solid 2px;
	}
`;

function PhoneNumberField( { id, isRequired, contactInfo, countriesList, PhoneInput, setters } ) {
	const translate = useTranslate();
	const { updatePhone, updatePhoneNumberCountry } = setters;

	const isError = contactInfo.phone.isTouched && ! isValid( contactInfo.phone );
	return (
		<PhoneNumberFieldUI>
			<Label htmlFor={ id }>
				{ isRequired ? translate( 'Phone number (Optional)' ) : translate( 'Phone number' ) }
			</Label>
			<PhoneInput
				name={ id }
				isError={ isError }
				enableStickyCountry={ false }
				onChange={ ( { value, countryCode } ) => {
					updatePhone( value );
					updatePhoneNumberCountry( countryCode );
				} }
				value={ contactInfo.phone.value }
				countryCode={
					contactInfo.phoneNumberCountry.value || contactInfo.countryCode.value || 'US'
				}
				countriesList={ countriesList }
			/>
			{ isError && <ErrorMessage>{ translate( 'This field is required.' ) }</ErrorMessage> }
		</PhoneNumberFieldUI>
	);
}

const ErrorMessage = styled.p`
	margin: 8px 0 0 0;
	color: ${props => props.theme.colors.error};
	font-style: italic;
	font-size: 14px;
`;

const PhoneNumberFieldUI = styled.div`
	margin-top: 16px;
`;

const Label = styled.label`
	display: block;
	color: ${props => props.theme.colors.textColor};
	font-weight: ${props => props.theme.weights.bold};
	font-size: 14px;
	margin-bottom: 8px;

	:hover {
		cursor: ${props => ( props.isDisabled ? 'default' : 'pointer' )};
	}
`;

PhoneNumberField.propTypes = {
	isRequired: PropTypes.bool,
	id: PropTypes.string.isRequired,
	contactInfo: PropTypes.shape( {
		phoneNumber: PropTypes.shape( { value: PropTypes.string } ),
		phoneNumberCountry: PropTypes.shape( { value: PropTypes.string } ),
	} ).isRequired,
	countriesList: PropTypes.array.isRequired,
	PhoneInput: PropTypes.elementType.isRequired,
};

function VatIdField() {
	const translate = useTranslate();
	const { vatId } = useSelect( select => select( 'wpcom' ).getContactInfo() );
	const { updateVatId } = useDispatch( 'wpcom' );

	return (
		<FormField
			id="contact-vat-id"
			type="Number"
			label={ translate( 'VAT identification number' ) }
			value={ vatId.value }
			onChange={ updateVatId }
			isError={ vatId.isTouched && ! vatId.isValid }
			errorMessage={ translate( 'This field is required.' ) }
		/>
	);
}

function TaxFields( { section, taxInfo, setters, CountrySelectMenu, countriesList } ) {
	const translate = useTranslate();
	const { postalCode, countryCode } = taxInfo;
	const { updatePostalCode, updateCountryCode } = setters;

	const isZip = isZipOrPostal() === 'zip';
	return (
		<FieldRow>
			<LeftColumn>
				<Field
					id={ section + '-postal-code' }
					type="text"
					label={ isZip ? translate( 'Zip code' ) : translate( 'Postal code' ) }
					value={ postalCode.value }
					onChange={ event => {
						updatePostalCode( event.target.value );
					} }
					autoComplete={ section + ' postal-code' }
					isError={ postalCode.isTouched && ! isValid( postalCode ) }
					errorMessage={ translate( 'This field is required.' ) }
				/>
			</LeftColumn>

			<RightColumn>
				<CountrySelectMenu
					translate={ translate }
					onChange={ event => {
						updateCountryCode( event.target.value );
					} }
					isError={ countryCode.isTouched && ! isValid( countryCode ) }
					isDisabled={ false } // TODO
					errorMessage={ translate( 'This field is required.' ) }
					currentValue={ countryCode.value }
					countriesList={ countriesList }
				/>
			</RightColumn>
		</FieldRow>
	);
}

TaxFields.propTypes = {
	section: PropTypes.string.isRequired,
	taxInfo: PropTypes.object.isRequired,
	setters: PropTypes.object.isRequired,
};

function isZipOrPostal() {
	//TODO: Add location detection to return "zip" or "postal"
	return 'postal';
}

const DomainContactFieldsDescription = styled.p`
	font-size: 14px;
	color: ${props => props.theme.colors.textColor};
	margin: 0 0 16px;
`;

function ContactFormSummary() {
	const translate = useTranslate();
	const contactInfo = useSelect( select => select( 'wpcom' ).getContactInfo() );

	//Check if paymentData is empty
	if ( Object.entries( contactInfo ).length === 0 ) {
		return null;
	}

	const fullName = joinNonEmptyValues(
		' ',
		contactInfo.firstName.value,
		contactInfo.lastName.value
	);
	const cityAndState = joinNonEmptyValues( ', ', contactInfo.city.value, contactInfo.state.value );
	const postalAndCountry = joinNonEmptyValues(
		', ',
		contactInfo.postalCode.value,
		contactInfo.countryCode.value
	);

	return (
		<GridRow>
			<div>
				<SummaryDetails>
					{ fullName && <SummaryLine>{ fullName }</SummaryLine> }

					{ contactInfo.email.value.length > 0 && (
						<SummarySpacerLine>{ contactInfo.email.value }</SummarySpacerLine>
					) }

					{ contactInfo.address1.value.length > 0 && (
						<SummaryLine>{ contactInfo.address1.value } </SummaryLine>
					) }

					{ cityAndState && <SummaryLine>{ cityAndState }</SummaryLine> }

					{ postalAndCountry && <SummaryLine>{ postalAndCountry }</SummaryLine> }
				</SummaryDetails>

				{ contactInfo.vatId.value.length > 0 && (
					<SummaryDetails>
						{ contactInfo.vatId.value.length > 0 && (
							<SummaryLine>
								{ translate( 'VAT indentification number:' ) }
								{ contactInfo.vatId.value }
							</SummaryLine>
						) }
					</SummaryDetails>
				) }
			</div>
		</GridRow>
	);
}

function joinNonEmptyValues( joinString, ...values ) {
	return values.filter( value => value.length > 0 ).join( joinString );
}

function contactDetailsFormat( { isDomainFieldsVisible } ) {
	if ( isDomainFieldsVisible ) {
		return 'DOMAINS';
	}
	return 'DEFAULT';
}

function renderContactDetails( {
	translate,
	domainName,
	isDomainFieldsVisible,
	contactInfo,
	renderDomainContactFields,
	setters,
	PhoneInput,
	CountrySelectMenu,
	countriesList,
} ) {
	const format = contactDetailsFormat( { isDomainFieldsVisible } );
	const requiresVatId = isEligibleForVat( contactInfo.countryCode.value );
	switch ( format ) {
		case 'DOMAINS':
			return (
				<React.Fragment>
					<DomainContactFieldsDescription>
						{ translate(
							'Registering a domain name requires valid contact information. Privacy Protection is included for all eligible domains to protect your personal information.'
						) }
					</DomainContactFieldsDescription>
					{ renderDomainContactFields(
						[ domainName ],
						prepareDomainContactDetails( contactInfo ),
						setters.updateContactDetails,
						setters.applyDomainContactValidationResults
					) }
					{ requiresVatId && <VatIdField /> }
				</React.Fragment>
			);
		default:
			return (
				<React.Fragment>
					<TaxFields
						section="contact"
						taxInfo={ contactInfo }
						setters={ setters }
						CountrySelectMenu={ CountrySelectMenu }
						countriesList={ countriesList }
					/>

					<PhoneNumberField
						id="contact-phone-number"
						countriesList={ countriesList }
						contactInfo={ contactInfo }
						PhoneInput={ PhoneInput }
						setters={ setters }
					/>
					{ requiresVatId && <VatIdField /> }
				</React.Fragment>
			);
	}
}
