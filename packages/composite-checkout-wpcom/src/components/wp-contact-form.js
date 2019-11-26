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

export default function WPContactForm( { summary, isComplete, isActive } ) {
	const isDomainFieldsVisible = useHasDomainsInCart();
	const contactInfo = useSelect( select => select( 'wpcom' ).getContactInfo() );
	const isDomainContactSame = useSelect( select => select( 'wpcom' ).isDomainContactSame() );
	const setters = useDispatch( 'wpcom' );

	if ( summary && isComplete ) {
		return <ContactFormSummary />;
	}
	if ( ! isActive ) {
		return null;
	}

	const toggleDomainFieldsVisibility = () =>
		setters.setIsDomainContactSame( ! isDomainContactSame );

	return (
		<BillingFormFields>
			{ isDomainFieldsVisible && (
				<AddressFields section="contact" contactInfo={ contactInfo } setters={ setters } />
			) }

			<TaxFields section="contact" taxInfo={ contactInfo } setters={ setters } />

			<PhoneNumberField
				id="contact-phone-number"
				phoneNumber={ contactInfo.phoneNumber || '' }
				onChange={ setters.setPhoneNumber }
			/>

			{ isElligibleForVat() && <VatIdField /> }

			{ isDomainFieldsVisible && (
				<DomainFieldsCheckbox
					toggleVisibility={ toggleDomainFieldsVisibility }
					isDomainContactVisible={ ! isDomainContactSame }
				/>
			) }

			{ ! isDomainContactSame && isDomainFieldsVisible && <DomainFields /> }
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

function AddressFields( { section, contactInfo, setters } ) {
	const translate = useTranslate();
	const { firstName, lastName, email, address, city, state, province } = contactInfo;
	const {
		setFirstName,
		setLastName,
		setEmail,
		setAddress,
		setCity,
		setState,
		setProvince,
	} = setters;

	return (
		<React.Fragment>
			<FieldRow>
				<LeftColumn>
					<Field
						id={ section + '-first-name' }
						type="text"
						label={ translate( 'First name' ) }
						value={ firstName || '' }
						onChange={ setFirstName }
						autoComplete="given-name"
					/>
				</LeftColumn>

				<RightColumn>
					<Field
						id={ section + '-last-name' }
						type="text"
						label={ translate( 'Last name' ) }
						value={ lastName || '' }
						onChange={ setLastName }
						autoComplete="family-name"
					/>
				</RightColumn>
			</FieldRow>

			<FormField
				id={ section + '-email-address' }
				type="email"
				label={ translate( 'Email address' ) }
				placeholder={ translate( 'name@example.com' ) }
				value={ email || '' }
				onChange={ setEmail }
				autoComplete="email"
			/>

			<FormField
				id={ section + '-address' }
				type="text"
				label={ translate( 'Address' ) }
				value={ address || '' }
				onChange={ setAddress }
				autoComplete={ section + ' street-address' }
			/>

			<FieldRow>
				<LeftColumn>
					<Field
						id={ section + '-city' }
						type="text"
						label={ translate( 'City' ) }
						value={ city || '' }
						onChange={ setCity }
						autoComplete={ section + ' address-level2' }
					/>
				</LeftColumn>

				<RightColumn>
					{ isStateorProvince() === 'state' ? (
						<Field
							id={ section + '-state' }
							type="text"
							label={ translate( 'State' ) }
							value={ state || '' }
							onChange={ setState }
							autoComplete={ section + ' address-level1' }
						/>
					) : (
						<Field
							id={ section + '-province' }
							type="text"
							label={ translate( 'Province' ) }
							value={ province || '' }
							onChange={ setProvince }
							autoComplete={ section + ' address-level1' }
						/>
					) }
				</RightColumn>
			</FieldRow>
		</React.Fragment>
	);
}

AddressFields.propTypes = {
	section: PropTypes.string.isRequired,
	contactInfo: PropTypes.object.isRequired,
	setters: PropTypes.object.isRequired,
};

function isStateorProvince() {
	//TODO: Add location detection to return "state" or "province"
	return 'province';
}

function PhoneNumberField( { id, isRequired, phoneNumber, onChange } ) {
	const translate = useTranslate();

	return (
		<FormField
			id={ id }
			type="Number"
			label={ isRequired ? translate( 'Phone number (Optional)' ) : translate( 'Phone number' ) }
			value={ phoneNumber || '' }
			onChange={ onChange }
			autoComplete="tel"
		/>
	);
}

PhoneNumberField.propTypes = {
	isRequired: PropTypes.bool,
	id: PropTypes.string.isRequired,
	phoneNumber: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
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
			value={ vatId || '' }
			onChange={ setVatId }
		/>
	);
}

function TaxFields( { section, taxInfo, setters } ) {
	const translate = useTranslate();
	const { postalCode, country } = taxInfo;
	const { setPostalCode, setCountry } = setters;

	return (
		<FieldRow>
			<LeftColumn>
				{ isZipOrPostal() === 'zip' ? (
					<Field
						id={ section + '-zip-code' }
						type="text"
						label={ translate( 'Zip code' ) }
						value={ postalCode || '' }
						onChange={ setPostalCode }
						autoComplete={ section + ' postal-code' }
					/>
				) : (
					<Field
						id={ section + '-postal-code' }
						type="text"
						label={ translate( 'Postal code' ) }
						value={ postalCode || '' }
						onChange={ setPostalCode }
						autoComplete={ section + ' postal-code' }
					/>
				) }
			</LeftColumn>

			<RightColumn>
				<Field
					id={ section + '-country' }
					type="text"
					label={ translate( 'Country' ) }
					value={ country || '' }
					onChange={ setCountry }
					autoComplete={ section + ' country' }
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

function DomainFields() {
	const translate = useTranslate();
	const contactInfo = useSelect( select => select( 'wpcom' ).getDomainContactInfo() );
	const {
		setDomainFirstName: setFirstName,
		setDomainLastName: setLastName,
		setDomainEmail: setEmail,
		setDomainAddress: setAddress,
		setDomainCity: setCity,
		setDomainState: setState,
		setDomainProvince: setProvince,
	} = useDispatch( 'wpcom' );
	const setters = {
		setFirstName,
		setLastName,
		setEmail,
		setAddress,
		setCity,
		setState,
		setProvince,
	};

	return (
		<DomainContactFields>
			<DomainContactFieldsTitle>
				{ translate( 'Enter your domain registration contact information' ) }
			</DomainContactFieldsTitle>
			<DomainContactFieldsDescription>
				{ translate(
					'Domain owners have to share contact information in a public database of all domains. With our Privacy Protection, we publish our own information and privately forward any communication to you.'
				) }
			</DomainContactFieldsDescription>

			<AddressFields section="domains" contactInfo={ contactInfo } setters={ setters } />
			<TaxFields section="domains" taxInfo={ contactInfo } setters={ setters } />
			<PhoneNumberField
				id="domains-phone-number"
				isRequired
				phoneNumber={ contactInfo.phoneNumber }
				onChange={ setters.setPhoneNumber }
			/>
		</DomainContactFields>
	);
}

const DomainContactFields = styled.div`
	margin: 16px 0 24px;
`;

const DomainContactFieldsTitle = styled.h2`
	font-size: 16px;
	margin: 0 0 4px;
	font-weight: 600;
	color: ${props => props.theme.colors.borderColorDark};
	padding-top: 24px;
	border-top: 1px solid ${props => props.theme.colors.borderColorLight};
`;

const DomainContactFieldsDescription = styled.p`
	font-size: 14px;
	color: ${props => props.theme.colors.textColor};
	margin: 0 0 16px;
`;

function ContactFormSummary() {
	const translate = useTranslate();
	const contactInfo = useSelect( select => select( 'wpcom' ).getContactInfo() );
	const domainContactInfo = useSelect( select => select( 'wpcom' ).getDomainContactInfo() );
	const isDomainContactSame = useSelect( select => select( 'wpcom' ).isDomainContactSame() );

	//Check if paymentData is empty
	if (
		Object.entries( contactInfo ).length === 0 &&
		Object.entries( domainContactInfo ).length === 0
	) {
		return null;
	}

	return (
		<GridRow>
			<div>
				<SummaryDetails>
					{ ( contactInfo.firstName || contactInfo.lastName ) && (
						<SummaryLine>
							{ contactInfo.firstName } { contactInfo.lastName }
						</SummaryLine>
					) }

					{ contactInfo.email && <SummarySpacerLine>{ contactInfo.email }</SummarySpacerLine> }

					{ contactInfo.address && <SummaryLine>{ contactInfo.address } </SummaryLine> }

					{ ( contactInfo.city || contactInfo.state || contactInfo.province ) && (
						<SummaryLine>
							{ contactInfo.city && contactInfo.city + ', ' }{ ' ' }
							{ contactInfo.state || contactInfo.province }
						</SummaryLine>
					) }

					{ ( contactInfo.postalCode || contactInfo.country ) && (
						<SummaryLine>
							{ contactInfo.postalCode && contactInfo.postalCode + ', ' }
							{ contactInfo.country }
						</SummaryLine>
					) }
				</SummaryDetails>

				{ ( contactInfo.phoneNumber || ( isElligibleForVat() && contactInfo.vatId ) ) && (
					<SummaryDetails>
						<SummaryLine>{ contactInfo.phoneNumber }</SummaryLine>
						{ isElligibleForVat() && (
							<SummaryLine>
								{ translate( 'VAT indentification number:' ) }
								{ contactInfo.vatId }
							</SummaryLine>
						) }
					</SummaryDetails>
				) }
			</div>

			{ domainContactInfo.domains && ! isDomainContactSame && (
				<div>
					<SummaryDetails>
						{ ( domainContactInfo.firstName || domainContactInfo.lastName ) && (
							<SummaryLine>
								{ domainContactInfo.firstName + ' ' + domainContactInfo.lastName }
							</SummaryLine>
						) }

						{ domainContactInfo.email && (
							<SummarySpacerLine>{ domainContactInfo.email }</SummarySpacerLine>
						) }

						{ domainContactInfo.address && (
							<SummaryLine>{ domainContactInfo.address }</SummaryLine>
						) }

						{ ( domainContactInfo.city ||
							domainContactInfo.city ||
							domainContactInfo.state ||
							domainContactInfo.province ) && (
							<SummaryLine>
								{ domainContactInfo.city && domainContactInfo.city + ', ' }{ ' ' }
								{ domainContactInfo.state || domainContactInfo.province }
							</SummaryLine>
						) }

						{ ( domainContactInfo.postalCode || domainContactInfo.country ) && (
							<SummaryLine>
								{ domainContactInfo.domainPostalCode && domainContactInfo.domainPostalCode + ', ' }{ ' ' }
								{ domainContactInfo.country }
							</SummaryLine>
						) }
					</SummaryDetails>

					{ domainContactInfo.phoneNumber && (
						<SummaryDetails>
							<SummaryLine>{ domainContactInfo.phoneNumber }</SummaryLine>
						</SummaryDetails>
					) }
				</div>
			) }
		</GridRow>
	);
}

export function getDomainDetailsFromPaymentData( paymentData ) {
	const { contactInfo = {}, domainContactInfo = {}, isDomainContactSame = true } = paymentData;
	return {
		first_name: isDomainContactSame
			? contactInfo.name
			: domainContactInfo.name || contactInfo.name || '',
		last_name: isDomainContactSame
			? contactInfo.name
			: domainContactInfo.name || contactInfo.name || '', // TODO: how do we split up first/last name?
		address_1: isDomainContactSame
			? contactInfo.address
			: domainContactInfo.address || contactInfo.address || '',
		city: isDomainContactSame ? contactInfo.city : domainContactInfo.city || contactInfo.city || '',
		state: isDomainContactSame
			? contactInfo.state || contactInfo.province
			: domainContactInfo.state ||
			  domainContactInfo.province ||
			  contactInfo.state ||
			  contactInfo.province ||
			  '',
		postal_code: isDomainContactSame
			? contactInfo.postalCode
			: domainContactInfo.postalCode || contactInfo.postalCode || '',
		country_code: isDomainContactSame
			? contactInfo.country
			: domainContactInfo.country || contactInfo.country || '',
		email: isDomainContactSame
			? contactInfo.email
			: domainContactInfo.email || contactInfo.email || '', // TODO: we need to get email address
		phone: isDomainContactSame ? '' : domainContactInfo.phoneNumber || '',
	};
}
