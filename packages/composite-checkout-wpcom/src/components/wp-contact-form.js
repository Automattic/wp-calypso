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

export default function WPContactForm( {
	summary,
	isComplete,
	isActive,
	CountrySelectMenu,
	PhoneInput,
	StateSelect,
	countriesList,
} ) {
	const isDomainFieldsVisible = useHasDomainsInCart();
	const contactInfo = useSelect( select => select( 'wpcom' ).getContactInfo() );
	const setters = useDispatch( 'wpcom' );

	if ( summary && isComplete ) {
		return <ContactFormSummary />;
	}
	if ( ! isActive ) {
		return null;
	}

	return (
		<BillingFormFields>
			{ isDomainFieldsVisible && <DomainFields StateSelect={ StateSelect } /> }

			<TaxFields
				section="contact"
				taxInfo={ contactInfo }
				setters={ setters }
				CountrySelectMenu={ CountrySelectMenu }
				countriesList={ countriesList }
			/>

			<PhoneNumberField
				id="contact-phone-number"
				setContactField={ setters.setContactField }
				countriesList={ countriesList }
				contactInfo={ contactInfo }
				PhoneInput={ PhoneInput }
			/>

			{ isElligibleForVat() && <VatIdField /> }
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

function isElligibleForVat() {
	//TODO: Detect whether people are in EU or AU and return true if they are
	return false;
}

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

function AddressFields( { section, contactInfo, setters, StateSelect } ) {
	const translate = useTranslate();
	const { firstName, lastName, email, address, city, state, country } = contactInfo;
	const { setContactField } = setters;

	return (
		<React.Fragment>
			<FieldRow>
				<LeftColumn>
					<Field
						id={ section + '-first-name' }
						type="text"
						label={ translate( 'First name' ) }
						value={ firstName.value }
						onChange={ value =>
							setContactField( 'firstName', { value, isTouched: true, isValid: !! value } )
						}
						autoComplete="given-name"
						isError={ firstName.isTouched && ! firstName.isValid }
						errorMessage={ translate( 'This field is required.' ) }
					/>
				</LeftColumn>

				<RightColumn>
					<Field
						id={ section + '-last-name' }
						type="text"
						label={ translate( 'Last name' ) }
						value={ lastName.value }
						onChange={ value =>
							setContactField( 'lastName', { value, isTouched: true, isValid: !! value } )
						}
						autoComplete="family-name"
						isError={ lastName.isTouched && ! lastName.isValid }
						errorMessage={ translate( 'This field is required.' ) }
					/>
				</RightColumn>
			</FieldRow>

			<FormField
				id={ section + '-email-address' }
				type="email"
				label={ translate( 'Email address' ) }
				placeholder={ translate( 'name@example.com' ) }
				value={ email.value }
				onChange={ value =>
					setContactField( 'email', { value, isTouched: true, isValid: !! value } )
				}
				autoComplete="email"
				isError={ email.isTouched && ! email.isValid }
				errorMessage={ translate( 'This field is required.' ) }
			/>

			<FormField
				id={ section + '-address' }
				type="text"
				label={ translate( 'Address' ) }
				value={ address.value }
				onChange={ value =>
					setContactField( 'address', { value, isTouched: true, isValid: !! value } )
				}
				autoComplete={ section + ' street-address' }
				isError={ address.isTouched && ! address.isValid }
				errorMessage={ translate( 'This field is required.' ) }
			/>

			<FieldRow>
				<LeftColumn>
					<Field
						id={ section + '-city' }
						type="text"
						label={ translate( 'City' ) }
						value={ city.value }
						onChange={ value =>
							setContactField( 'city', { value, isTouched: true, isValid: !! value } )
						}
						autoComplete={ section + ' address-level2' }
						isError={ city.isTouched && ! city.isValid }
						errorMessage={ translate( 'This field is required.' ) }
					/>
				</LeftColumn>

				<RightColumn>
					<StateSelectWrapper>
						<StateSelect
							countryCode={ country.value || 'US' }
							label={
								isStateorProvince() === 'state' ? translate( 'State' ) : translate( 'Province' )
							}
							name={ section + '-state' }
							onChange={ event =>
								setContactField( 'state', {
									value: event.target.value,
									isTouched: true,
									isValid: !! event.target.value,
								} )
							}
							value={ state.value }
						/>
					</StateSelectWrapper>
				</RightColumn>
			</FieldRow>
		</React.Fragment>
	);
}

AddressFields.propTypes = {
	section: PropTypes.string.isRequired,
	contactInfo: PropTypes.object.isRequired,
	setters: PropTypes.object.isRequired,
	StateSelect: PropTypes.elementType.isRequired,
};

function isStateorProvince() {
	//TODO: Add location detection to return "state" or "province"
	return 'state';
}

function PhoneNumberField( {
	id,
	isRequired,
	setContactField,
	contactInfo,
	countriesList,
	PhoneInput,
} ) {
	const translate = useTranslate();

	const isError = contactInfo.phoneNumber.isTouched && ! contactInfo.phoneNumber.isValid;
	return (
		<PhoneNumberFieldUI>
			<Label htmlFor={ id }>
				{ isRequired ? translate( 'Phone number (Optional)' ) : translate( 'Phone number' ) }
			</Label>
			<PhoneInput
				name={ id }
				isError={ isError }
				onChange={ ( { value, countryCode } ) => {
					setContactField( 'phoneNumber', {
						value,
						isTouched: true,
						isValid: isRequired ? !! value : true,
					} );
					setContactField( 'phoneNumberCountry', {
						countryCode,
						isTouched: true,
						isValid: !! value,
					} );
				} }
				value={ contactInfo.phoneNumber.value }
				countryCode={ contactInfo.phoneNumberCountry.value || 'US' }
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
	setContactField: PropTypes.func.isRequired,
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
	const { setVatId } = useDispatch( 'wpcom' );

	return (
		<FormField
			id="contact-vat-id"
			type="Number"
			label={ translate( 'VAT identification number' ) }
			value={ vatId.value }
			onChange={ value => setVatId( { value, isTouched: true, isValid: !! value } ) }
			isError={ vatId.isTouched && ! vatId.isValid }
			errorMessage={ translate( 'This field is required.' ) }
		/>
	);
}

function TaxFields( { section, taxInfo, setters, CountrySelectMenu, countriesList } ) {
	const translate = useTranslate();
	const { postalCode, country } = taxInfo;
	const { setContactField } = setters;

	const isZip = isZipOrPostal() === 'zip';
	return (
		<FieldRow>
			<LeftColumn>
				<Field
					id={ section + '-postal-code' }
					type="text"
					label={ isZip ? translate( 'Zip code' ) : translate( 'Postal code' ) }
					value={ postalCode.value }
					onChange={ value =>
						setContactField( 'postalCode', { value, isTouched: true, isValid: !! value } )
					}
					autoComplete={ section + ' postal-code' }
					isError={ postalCode.isTouched && ! postalCode.isValid }
					errorMessage={ translate( 'This field is required.' ) }
				/>
			</LeftColumn>

			<RightColumn>
				<CountrySelectMenu
					translate={ translate }
					onChange={ event => {
						const value = event.target.value;
						setContactField( 'country', { value, isTouched: true, isValid: !! value } );
					} }
					isError={ country.isTouched && ! country.isValid }
					isDisabled={ false } // TODO
					errorMessage={ translate( 'This field is required.' ) }
					currentValue={ country.value }
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

function DomainFields( { StateSelect } ) {
	const translate = useTranslate();
	const contactInfo = useSelect( select => select( 'wpcom' ).getContactInfo() );
	const setters = useDispatch( 'wpcom' );

	return (
		<DomainContactFields>
			<DomainContactFieldsDescription>
				{ translate(
					'Registering a domain name requires valid contact information. Privacy Protection is included for all eligible domains to protect your personal information.'
				) }
			</DomainContactFieldsDescription>

			<AddressFields
				section="contact"
				contactInfo={ contactInfo }
				setters={ setters }
				StateSelect={ StateSelect }
			/>
		</DomainContactFields>
	);
}

const DomainContactFields = styled.div`
	margin: 16px 0 24px;
`;

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
		contactInfo.country.value
	);

	return (
		<GridRow>
			<div>
				<SummaryDetails>
					{ fullName && <SummaryLine>{ fullName }</SummaryLine> }

					{ contactInfo.email.value.length > 0 && (
						<SummarySpacerLine>{ contactInfo.email.value }</SummarySpacerLine>
					) }

					{ contactInfo.address.value.length > 0 && (
						<SummaryLine>{ contactInfo.address.value } </SummaryLine>
					) }

					{ cityAndState && <SummaryLine>{ cityAndState }</SummaryLine> }

					{ postalAndCountry && <SummaryLine>{ postalAndCountry }</SummaryLine> }
				</SummaryDetails>

				{ ( contactInfo.phoneNumber.value.length > 0 || contactInfo.vatId.value.length > 0 ) && (
					<SummaryDetails>
						<SummaryLine>{ contactInfo.phoneNumber.value }</SummaryLine>
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

const StateSelectWrapper = styled.div`
	& select {
		width: 100%;
	}
`;
