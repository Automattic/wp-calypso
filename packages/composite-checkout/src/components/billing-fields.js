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
import { useLineItems, usePaymentData } from '../public-api';
import GridRow from './grid-row';
import Field from './field';

export default function BillingFields( { summary, isActive, isComplete } ) {
	const [ items ] = useLineItems();
	const [ paymentData, dispatch ] = usePaymentData();
	const { isDomainContactSame = true } = paymentData;

	if ( summary && isComplete ) {
		return <BillingFormSummary />;
	}
	if ( ! isActive ) {
		return null;
	}

	function toggleDomainFieldsVisibility() {
		dispatch( {
			type: 'PAYMENT_DATA_UPDATE',
			payload: { isDomainContactSame: ! isDomainContactSame },
		} );
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
	const [ paymentData, dispatch ] = usePaymentData();
	const currentLocationData = paymentData[ fieldType ] || {};
	const updatePaymentData = ( key, value ) =>
		dispatch( { type: 'PAYMENT_DATA_UPDATE', payload: { [ key ]: value } } );
	const updateLocationData = ( key, value ) =>
		updatePaymentData( fieldType, { ...currentLocationData, [ key ]: value } );

	return (
		<React.Fragment>
			<FormField
				id={ fieldType + '-name' }
				type="Text"
				label={ localize( 'Name' ) }
				value={ currentLocationData.name || '' }
				onChange={ value => {
					updateLocationData( 'name', value );
				} }
			/>

			<FormField
				id={ fieldType + '-address' }
				type="Text"
				label={ localize( 'Address' ) }
				value={ currentLocationData.address || '' }
				onChange={ value => {
					updateLocationData( 'address', value );
				} }
			/>

			<FieldRow gap="4%" columnWidths="48% 48%">
				<Field
					id={ fieldType + '-city' }
					type="Text"
					label={ localize( 'City' ) }
					value={ currentLocationData.city || '' }
					onChange={ value => {
						updateLocationData( 'city', value );
					} }
				/>

				{ isStateorProvince() === 'state' ? (
					<Field
						id={ fieldType + '-state' }
						type="Text"
						label={ localize( 'State' ) }
						value={ currentLocationData.state || '' }
						onChange={ value => {
							updateLocationData( 'state', value );
						} }
					/>
				) : (
					<Field
						id={ fieldType + '-province' }
						type="Text"
						label={ localize( 'Province' ) }
						value={ currentLocationData.province || '' }
						onChange={ value => {
							updateLocationData( 'province', value );
						} }
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
	const [ paymentData, dispatch ] = usePaymentData();
	const currentLocationData = paymentData[ fieldType ] || {};
	const updatePaymentData = ( key, value ) =>
		dispatch( { type: 'PAYMENT_DATA_UPDATE', payload: { [ key ]: value } } );
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
		/>
	);
}

PhoneNumberField.propTypes = {
	fieldType: PropTypes.string.isRequired,
};

function VatIdField() {
	const localize = useLocalize();
	const fieldType = 'billing';
	const [ paymentData, dispatch ] = usePaymentData();
	const currentLocationData = paymentData[ fieldType ] || {};
	const updatePaymentData = ( key, value ) =>
		dispatch( { type: 'PAYMENT_DATA_UPDATE', payload: { [ key ]: value } } );
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
	const [ paymentData, dispatch ] = usePaymentData();
	const currentLocationData = paymentData[ fieldType ] || {};
	const updatePaymentData = ( key, value ) =>
		dispatch( { type: 'PAYMENT_DATA_UPDATE', payload: { [ key ]: value } } );
	const updateLocationData = ( key, value ) =>
		updatePaymentData( fieldType, { ...currentLocationData, [ key ]: value } );

	return (
		<React.Fragment>
			<FieldRow gap="4%" columnWidths="48% 48%">
				{ isZipOrPostal() === 'zip' ? (
					<Field
						id={ fieldType + '-zip-code' }
						type="Text"
						label={ localize( 'Zip code' ) }
						value={ currentLocationData.zipCode || '' }
						onChange={ value => {
							updateLocationData( 'zipCode', value );
						} }
					/>
				) : (
					<Field
						id={ fieldType + '-postal-code' }
						type="Text"
						label={ localize( 'Postal code' ) }
						value={ currentLocationData.postalCode || '' }
						onChange={ value => {
							updateLocationData( 'postalCode', value );
						} }
					/>
				) }

				<Field
					id={ fieldType + '-country' }
					type="Text"
					label={ localize( 'Country' ) }
					value={ currentLocationData.country || '' }
					onChange={ value => {
						updateLocationData( 'country', value );
					} }
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
	const [ paymentData ] = usePaymentData();
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
					<BillingSummaryLine>{ billing.name || '' } </BillingSummaryLine>
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
						<BillingSummaryLine>{ domains.name }</BillingSummaryLine>
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
