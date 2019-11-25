/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { usePaymentData } from '@automattic/composite-checkout';
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
	const [ paymentData, updatePaymentData ] = usePaymentData();
	const { isDomainContactSame = true } = paymentData;

	if ( summary && isComplete ) {
		return <ContactFormSummary />;
	}
	if ( ! isActive ) {
		return null;
	}

	const toggleDomainFieldsVisibility = () => {
		updatePaymentData( 'isDomainContactSame', ! isDomainContactSame );
	};

	return (
		<BillingFormFields>
			{ isDomainFieldsVisible && <AddressFields fieldType={ 'billing' } /> }

			<TaxFields fieldType={ 'billing' } />

			<PhoneNumberField fieldType={ 'billing' } />

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

function AddressFields( { fieldType } ) {
	const translate = useTranslate();
	const [ paymentData, updatePaymentData ] = usePaymentData();
	const currentLocationData = paymentData[ fieldType ] || {};
	const updateLocationData = ( key, value ) =>
		updatePaymentData( fieldType, { ...currentLocationData, [ key ]: value } );

	return (
		<React.Fragment>
			<FieldRow>
				<LeftColumn>
					<Field
						id={ fieldType + '-first-name' }
						type="text"
						label={ translate( 'First name' ) }
						value={ currentLocationData.firstName || '' }
						onChange={ value => {
							updateLocationData( 'firstName', value );
						} }
						autoComplete="given-name"
					/>
				</LeftColumn>

				<RightColumn>
					<Field
						id={ fieldType + '-last-name' }
						type="text"
						label={ translate( 'Last name' ) }
						value={ currentLocationData.lastName || '' }
						onChange={ value => {
							updateLocationData( 'lastName', value );
						} }
						autoComplete="family-name"
					/>
				</RightColumn>
			</FieldRow>

			<FormField
				id={ fieldType + '-email-address' }
				type="email"
				label={ translate( 'Email address' ) }
				placeholder={ translate( 'name@example.com' ) }
				value={ currentLocationData.email || '' }
				onChange={ value => {
					updateLocationData( 'email', value );
				} }
				autoComplete="email"
			/>

			<FormField
				id={ fieldType + '-address' }
				type="text"
				label={ translate( 'Address' ) }
				value={ currentLocationData.address || '' }
				onChange={ value => {
					updateLocationData( 'address', value );
				} }
				autoComplete={ fieldType + ' street-address' }
			/>

			<FieldRow>
				<LeftColumn>
					<Field
						id={ fieldType + '-city' }
						type="text"
						label={ translate( 'City' ) }
						value={ currentLocationData.city || '' }
						onChange={ value => {
							updateLocationData( 'city', value );
						} }
						autoComplete={ fieldType + ' address-level2' }
					/>
				</LeftColumn>

				<RightColumn>
					{ isStateorProvince() === 'state' ? (
						<Field
							id={ fieldType + '-state' }
							type="text"
							label={ translate( 'State' ) }
							value={ currentLocationData.state || '' }
							onChange={ value => {
								updateLocationData( 'state', value );
							} }
							autoComplete={ fieldType + ' address-level1' }
						/>
					) : (
						<Field
							id={ fieldType + '-province' }
							type="text"
							label={ translate( 'Province' ) }
							value={ currentLocationData.province || '' }
							onChange={ value => {
								updateLocationData( 'province', value );
							} }
							autoComplete={ fieldType + ' address-level1' }
						/>
					) }
				</RightColumn>
			</FieldRow>
		</React.Fragment>
	);
}

AddressFields.propTypes = {
	fieldType: PropTypes.string.isRequired,
};

function isStateorProvince() {
	//TODO: Add location detection to return "state" or "province"
	return 'province';
}

function PhoneNumberField( { fieldType } ) {
	const translate = useTranslate();
	const [ paymentData, updatePaymentData ] = usePaymentData();
	const currentLocationData = paymentData[ fieldType ] || {};
	const updateLocationData = ( key, value ) =>
		updatePaymentData( fieldType, { ...currentLocationData, [ key ]: value } );

	return (
		<FormField
			id={ fieldType + '-phone-number' }
			type="Number"
			label={
				fieldType === 'billing'
					? translate( 'Phone number (Optional)' )
					: translate( 'Phone number' )
			}
			value={ currentLocationData.phoneNumber || '' }
			onChange={ value => {
				updateLocationData( 'phoneNumber', value );
			} }
			autoComplete="tel"
		/>
	);
}

PhoneNumberField.propTypes = {
	fieldType: PropTypes.string.isRequired,
};

function VatIdField() {
	const translate = useTranslate();
	const fieldType = 'billing';
	const [ paymentData, updatePaymentData ] = usePaymentData();
	const currentLocationData = paymentData[ fieldType ] || {};
	const updateLocationData = ( key, value ) =>
		updatePaymentData( fieldType, { ...currentLocationData, [ key ]: value } );

	return (
		<FormField
			id={ 'billing-vat-id' }
			type="Number"
			label={ translate( 'VAT identification number' ) }
			value={ currentLocationData.vatId || '' }
			onChange={ value => {
				updateLocationData( 'vatId', value );
			} }
		/>
	);
}

function TaxFields( { fieldType } ) {
	const translate = useTranslate();
	const [ paymentData, updatePaymentData ] = usePaymentData();
	const currentLocationData = paymentData[ fieldType ] || {};
	// TODO: add field validation; at least to see if a required field is set
	const updateLocationData = ( key, value ) =>
		updatePaymentData( fieldType, { ...currentLocationData, [ key ]: value } );

	return (
		<React.Fragment>
			<FieldRow>
				<LeftColumn>
					{ isZipOrPostal() === 'zip' ? (
						<Field
							id={ fieldType + '-zip-code' }
							type="text"
							label={ translate( 'Zip code' ) }
							value={ currentLocationData.zipCode || '' }
							onChange={ value => {
								updateLocationData( 'zipCode', value );
							} }
							autoComplete={ fieldType + ' postal-code' }
						/>
					) : (
						<Field
							id={ fieldType + '-postal-code' }
							type="text"
							label={ translate( 'Postal code' ) }
							value={ currentLocationData.postalCode || '' }
							onChange={ value => {
								updateLocationData( 'postalCode', value );
							} }
							autoComplete={ fieldType + ' postal-code' }
						/>
					) }
				</LeftColumn>

				<RightColumn>
					<Field
						id={ fieldType + '-country' }
						type="text"
						label={ translate( 'Country' ) }
						value={ currentLocationData.country || '' }
						onChange={ value => {
							updateLocationData( 'country', value );
						} }
						autoComplete={ fieldType + ' country' }
					/>
				</RightColumn>
			</FieldRow>
		</React.Fragment>
	);
}

TaxFields.propTypes = {
	fieldType: PropTypes.string.isRequired,
};

function isZipOrPostal() {
	//TODO: Add location detection to return "zip" or "postal"
	return 'postal';
}

function DomainFields() {
	const translate = useTranslate();

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

			<AddressFields fieldType={ 'domains' } />
			<TaxFields fieldType={ 'domains' } />
			<PhoneNumberField fieldType={ 'domains' } />
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
	const [ paymentData ] = usePaymentData();
	const { billing = {}, domains = {}, isDomainContactSame = true } = paymentData;

	//Check if paymentData is empty
	if ( Object.entries( paymentData ).length === 0 ) {
		return null;
	}

	const postalCode = billing.zipCode || billing.postalCode;
	const domainPostalCode = domains.zipCode || domains.postalCode;
	return (
		<GridRow>
			<div>
				<SummaryDetails>
					{ ( billing.firstName || billing.lastName ) && (
						<SummaryLine>
							{ billing.firstName } { billing.lastName }
						</SummaryLine>
					) }

					{ billing.email && <SummarySpacerLine>{ billing.email }</SummarySpacerLine> }

					{ billing.address && <SummaryLine>{ billing.address } </SummaryLine> }

					{ ( billing.city || billing.state || billing.province ) && (
						<SummaryLine>
							{ billing.city && billing.city + ', ' } { billing.state || billing.province }
						</SummaryLine>
					) }

					{ ( postalCode || billing.country ) && (
						<SummaryLine>
							{ postalCode && postalCode + ', ' }
							{ billing.country }
						</SummaryLine>
					) }
				</SummaryDetails>

				{ ( billing.phoneNumber || ( isElligibleForVat() && billing.vatId ) ) && (
					<SummaryDetails>
						<SummaryLine>{ billing.phoneNumber }</SummaryLine>
						{ isElligibleForVat() && (
							<SummaryLine>
								{ translate( 'VAT indentification number:' ) }
								{ billing.vatId }
							</SummaryLine>
						) }
					</SummaryDetails>
				) }
			</div>

			{ domains && ! isDomainContactSame && (
				<div>
					<SummaryDetails>
						{ ( domains.firstName || domains.lastName ) && (
							<SummaryLine>{ domains.firstName + ' ' + domains.lastName }</SummaryLine>
						) }

						{ domains.email && <SummarySpacerLine>{ domains.email }</SummarySpacerLine> }

						{ domains.address && <SummaryLine>{ domains.address }</SummaryLine> }

						{ ( domains.city || domains.city || domains.state || domains.province ) && (
							<SummaryLine>
								{ domains.city && domains.city + ', ' } { domains.state || domains.province }
							</SummaryLine>
						) }

						{ ( domainPostalCode || domains.country ) && (
							<SummaryLine>
								{ domainPostalCode && domainPostalCode + ', ' } { domains.country }
							</SummaryLine>
						) }
					</SummaryDetails>

					{ domains.phoneNumber && (
						<SummaryDetails>
							<SummaryLine>{ domains.phoneNumber }</SummaryLine>
						</SummaryDetails>
					) }
				</div>
			) }
		</GridRow>
	);
}

export function getDomainDetailsFromPaymentData( paymentData ) {
	const { billing = {}, domains = {}, isDomainContactSame = true } = paymentData;
	return {
		first_name: isDomainContactSame ? billing.name : domains.name || billing.name || '',
		last_name: isDomainContactSame ? billing.name : domains.name || billing.name || '', // TODO: how do we split up first/last name?
		address_1: isDomainContactSame ? billing.address : domains.address || billing.address || '',
		city: isDomainContactSame ? billing.city : domains.city || billing.city || '',
		state: isDomainContactSame
			? billing.state || billing.province
			: domains.state || domains.province || billing.state || billing.province || '',
		postal_code: isDomainContactSame
			? billing.postalCode || billing.zipCode
			: domains.postalCode || domains.zipCode || billing.postalCode || billing.zipCode || '',
		country_code: isDomainContactSame ? billing.country : domains.country || billing.country || '',
		email: isDomainContactSame ? billing.email : domains.email || billing.email || '', // TODO: we need to get email address
		phone: isDomainContactSame ? '' : domains.phoneNumber || '',
	};
}
