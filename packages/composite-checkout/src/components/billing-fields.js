/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

/**
 * Internal dependencies
 */
import { useLocalize } from '../lib/localize';
import { useLineItems, useSelect, useDispatch } from '../public-api';
import GridRow from './grid-row';
import Field from './field';

export default function BillingFields( { summary, isActive, isComplete } ) {
	const [ items ] = useLineItems();
	const paymentData = useSelect( select => select( 'checkout' ).getPaymentData() );
	const { updatePaymentData } = useDispatch( 'checkout' );
	const { isDomainContactSame = true } = paymentData;

	if ( summary && isComplete ) {
		return <BillingFormSummary />;
	}
	if ( ! isActive ) {
		return null;
	}

	function toggleDomainFieldsVisibility() {
		updatePaymentData( 'isDomainContactSame', ! isDomainContactSame );
	}

	return (
		<BillingFormFields>
			{ hasDomainsInCart( items ) && <AddressFields fieldType={ 'billing' } /> }

			<TaxFields fieldType={ 'billing' } />

			<PhoneNumberField fieldType={ 'billing' } />

			{ isElligibleForVat() && <VatIdField /> }

			{ hasDomainsInCart( items ) && (
				<DomainFieldsCheckbox
					toggleVisibility={ toggleDomainFieldsVisibility }
					isDomainContactVisible={ ! isDomainContactSame }
				/>
			) }

			{ ! isDomainContactSame && hasDomainsInCart( items ) && <DomainFields /> }
		</BillingFormFields>
	);
}

BillingFields.propTypes = {
	isActive: PropTypes.bool.isRequired,
	isComplete: PropTypes.bool.isRequired,
	summary: PropTypes.bool,
};

const BillingFormFields = styled.div`
	margin-bottom: 16px;
`;

const FormField = styled( Field )`
	margin-top: 16px;
	:first-child {
		margin-top: 0;
	}
`;

const FieldRow = styled( GridRow )`
	margin-top: 16px;

	first-child {
		margin-top: 0;
	}
`;

function hasDomainsInCart( items ) {
	if ( items.find( item => item.type === 'domain' ) ) {
		return true;
	}

	return false;
}

function isElligibleForVat() {
	//TODO: Detect whether people are in EU or AU and return true if they are
	return false;
}

function DomainFieldsCheckbox( { toggleVisibility, isDomainContactVisible } ) {
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
				Use your billing details for your domain registration contact information.
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
		outline: ${props => props.theme.colors.outline} auto 5px;
	}
`;

function AddressFields( { fieldType } ) {
	const localize = useLocalize();
	const paymentData = useSelect( select => select( 'checkout' ).getPaymentData() );
	const { updatePaymentData } = useDispatch( 'checkout' );
	const currentLocationData = paymentData[ fieldType ] || {};
	const updateLocationData = ( key, value ) =>
		updatePaymentData( fieldType, { ...currentLocationData, [ key ]: value } );

	return (
		<React.Fragment>
			<FieldRow gap="4%" columnWidths="48% 48%">
				<Field
					id={ fieldType + '-first-name' }
					type="text"
					label={ localize( 'First name' ) }
					value={ currentLocationData.firstName || '' }
					onChange={ value => {
						updateLocationData( 'firstName', value );
					} }
					autoComplete="given-name"
				/>

				<Field
					id={ fieldType + '-last-name' }
					type="text"
					label={ localize( 'Last name' ) }
					value={ currentLocationData.lastName || '' }
					onChange={ value => {
						updateLocationData( 'lastName', value );
					} }
					autoComplete="family-name"
				/>
			</FieldRow>

			<FormField
				id={ fieldType + '-email-address' }
				type="email"
				label={ localize( 'Email address' ) }
				placeholder={ localize( 'name@example.com' ) }
				value={ currentLocationData.email || '' }
				onChange={ value => {
					updateLocationData( 'email', value );
				} }
				autoComplete="email"
			/>

			<FormField
				id={ fieldType + '-address' }
				type="text"
				label={ localize( 'Address' ) }
				value={ currentLocationData.address || '' }
				onChange={ value => {
					updateLocationData( 'address', value );
				} }
				autoComplete={ fieldType + ' street-address' }
			/>

			<FieldRow gap="4%" columnWidths="48% 48%">
				<Field
					id={ fieldType + '-city' }
					type="text"
					label={ localize( 'City' ) }
					value={ currentLocationData.city || '' }
					onChange={ value => {
						updateLocationData( 'city', value );
					} }
					autoComplete={ fieldType + ' address-level2' }
				/>

				{ isStateorProvince() === 'state' ? (
					<Field
						id={ fieldType + '-state' }
						type="text"
						label={ localize( 'State' ) }
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
						label={ localize( 'Province' ) }
						value={ currentLocationData.province || '' }
						onChange={ value => {
							updateLocationData( 'province', value );
						} }
						autoComplete={ fieldType + ' address-level1' }
					/>
				) }
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
	const localize = useLocalize();
	const paymentData = useSelect( select => select( 'checkout' ).getPaymentData() );
	const { updatePaymentData } = useDispatch( 'checkout' );
	const currentLocationData = paymentData[ fieldType ] || {};
	const updateLocationData = ( key, value ) =>
		updatePaymentData( fieldType, { ...currentLocationData, [ key ]: value } );

	return (
		<FormField
			id={ fieldType + '-phone-number' }
			type="Number"
			label={
				fieldType === 'billing' ? localize( 'Phone number (Optional)' ) : localize( 'Phone number' )
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
	const localize = useLocalize();
	const fieldType = 'billing';
	const paymentData = useSelect( select => select( 'checkout' ).getPaymentData() );
	const { updatePaymentData } = useDispatch( 'checkout' );
	const currentLocationData = paymentData[ fieldType ] || {};
	const updateLocationData = ( key, value ) =>
		updatePaymentData( fieldType, { ...currentLocationData, [ key ]: value } );

	return (
		<FormField
			id={ 'billing-vat-id' }
			type="Number"
			label={ localize( 'VAT identification number' ) }
			value={ currentLocationData.vatId || '' }
			onChange={ value => {
				updateLocationData( 'vatId', value );
			} }
		/>
	);
}

function TaxFields( { fieldType } ) {
	const localize = useLocalize();
	const paymentData = useSelect( select => select( 'checkout' ).getPaymentData() );
	const { updatePaymentData } = useDispatch( 'checkout' );
	const currentLocationData = paymentData[ fieldType ] || {};
	const updateLocationData = ( key, value ) =>
		updatePaymentData( fieldType, { ...currentLocationData, [ key ]: value } );

	return (
		<React.Fragment>
			<FieldRow gap="4%" columnWidths="48% 48%">
				{ isZipOrPostal() === 'zip' ? (
					<Field
						id={ fieldType + '-zip-code' }
						type="text"
						label={ localize( 'Zip code' ) }
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
						label={ localize( 'Postal code' ) }
						value={ currentLocationData.postalCode || '' }
						onChange={ value => {
							updateLocationData( 'postalCode', value );
						} }
						autoComplete={ fieldType + ' postal-code' }
					/>
				) }

				<Field
					id={ fieldType + '-country' }
					type="text"
					label={ localize( 'Country' ) }
					value={ currentLocationData.country || '' }
					onChange={ value => {
						updateLocationData( 'country', value );
					} }
					autoComplete={ fieldType + ' country' }
				/>
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
	const localize = useLocalize();

	return (
		<DomainContactFields>
			<DomainContactFieldsTitle>
				{ localize( 'Enter your domain registration contact information' ) }
			</DomainContactFieldsTitle>
			<DomainContactFieldsDescription>
				{ localize( `Domain owners have to share contact information in a public database of all domains. With
				our Privacy Protection, we publish our own information and privately forward any
				communication to you.` ) }
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

function BillingFormSummary() {
	const localize = useLocalize();
	const paymentData = useSelect( select => select( 'checkout' ).getPaymentData() );
	const { billing = {}, domains = {}, isDomainContactSame = true } = paymentData;

	//Check if paymentData is empty
	if ( Object.entries( paymentData ).length === 0 ) {
		return null;
	}

	const postalCode = billing.zipCode || billing.postalCode;
	const domainPostalCode = domains.zipCode || domains.postalCode;
	return (
		<GridRow gap="4%" columnWidths="48% 48%">
			<div>
				<BillingSummaryDetails>
					<BillingSummaryLine>
						{ billing.firstName || '' } { billing.lastName || '' }
					</BillingSummaryLine>
					<BillingSummarySpacerLine>{ billing.email || '' }</BillingSummarySpacerLine>
					<BillingSummaryLine>{ billing.address || '' } </BillingSummaryLine>
					<BillingSummaryLine>
						{ billing.city && billing.city + ', ' } { billing.state || billing.province || '' }
					</BillingSummaryLine>
					<BillingSummaryLine>
						{ postalCode && postalCode + ', ' }
						{ billing.country }
					</BillingSummaryLine>
				</BillingSummaryDetails>
				{ ( billing.phoneNumber || ( isElligibleForVat() && billing.vatId ) ) && (
					<BillingSummaryDetails>
						<BillingSummaryLine>{ billing.phoneNumber }</BillingSummaryLine>
						{ isElligibleForVat() && (
							<BillingSummaryLine>
								{ localize( 'VAT indentification number:' ) }
								{ billing.vatId }
							</BillingSummaryLine>
						) }
					</BillingSummaryDetails>
				) }
			</div>
			{ domains && ! isDomainContactSame && (
				<div>
					<BillingSummaryDetails>
						<BillingSummaryLine>{ domains.firstName + ' ' + domains.lastName }</BillingSummaryLine>
						<BillingSummarySpacerLine>{ domains.email }</BillingSummarySpacerLine>
						<BillingSummaryLine>{ domains.address }</BillingSummaryLine>
						<BillingSummaryLine>
							{ domains.city && domains.city + ', ' } { domains.state || domains.province }
						</BillingSummaryLine>
						<BillingSummaryLine>
							{ domainPostalCode && domainPostalCode + ', ' } { domains.country }
						</BillingSummaryLine>
					</BillingSummaryDetails>

					<BillingSummaryDetails>
						<BillingSummaryLine>{ domains.phoneNumber }</BillingSummaryLine>
					</BillingSummaryDetails>
				</div>
			) }
		</GridRow>
	);
}

const BillingSummaryDetails = styled.ul`
	margin: 8px 0 0 0;
	padding: 0;

	:first-child {
		margin-top: 0;
	}
`;

const BillingSummaryLine = styled.li`
	margin: 0;
	padding: 0;
	list-style: none;
`;

const BillingSummarySpacerLine = styled( BillingSummaryLine )`
	margin-bottom: 8px;
`;

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
