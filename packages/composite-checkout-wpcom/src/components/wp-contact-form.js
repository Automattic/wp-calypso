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
import { prepareDomainContactDetails, prepareDomainContactDetailsErrors, isValid } from '../types';

export default function WPContactForm( {
	summary,
	isComplete,
	isActive,
	CountrySelectMenu,
	countriesList,
	renderDomainContactFields,
	updateContactDetails,
	updateCountryCode,
	updatePostalCode,
	shouldShowContactDetailsValidationErrors,
} ) {
	const translate = useTranslate();
	const isDomainFieldsVisible = useHasDomainsInCart();
	const contactInfo = useSelect( select => select( 'wpcom' ).getContactInfo() );

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
				isDomainFieldsVisible,
				contactInfo,
				renderDomainContactFields,
				updateContactDetails,
				updateCountryCode,
				updatePostalCode,
				CountrySelectMenu,
				countriesList,
				shouldShowContactDetailsValidationErrors,
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
	const countriesWithVAT = [];
	return countriesWithVAT.includes( country );
}

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
			isError={ vatId.isTouched && ! isValid( vatId ) }
			errorMessage={ translate( 'This field is required.' ) }
		/>
	);
}

function TaxFields( {
	section,
	taxInfo,
	CountrySelectMenu,
	countriesList,
	updatePostalCode,
	updateCountryCode,
} ) {
	const translate = useTranslate();
	const { postalCode, countryCode } = taxInfo;

	const isZip = isZipOrPostal() === 'zip';
	return (
		<FieldRow>
			<LeftColumn>
				<Field
					id={ section + '-postal-code' }
					type="text"
					label={ isZip ? translate( 'Zip code' ) : translate( 'Postal code' ) }
					value={ postalCode.value }
					onChange={ value => {
						updatePostalCode( value );
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
	updatePostalCode: PropTypes.func.isRequired,
	updateCountryCode: PropTypes.func.isRequired,
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

function getContactDetailsFormat( isDomainFieldsVisible ) {
	if ( isDomainFieldsVisible ) {
		return 'DOMAINS';
	}
	return 'DEFAULT';
}

function renderContactDetails( {
	translate,
	isDomainFieldsVisible,
	contactInfo,
	renderDomainContactFields,
	updateContactDetails,
	updateCountryCode,
	updatePostalCode,
	CountrySelectMenu,
	countriesList,
	shouldShowContactDetailsValidationErrors,
} ) {
	const format = getContactDetailsFormat( isDomainFieldsVisible );
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
						prepareDomainContactDetails( contactInfo ),
						prepareDomainContactDetailsErrors( contactInfo ),
						updateContactDetails,
						shouldShowContactDetailsValidationErrors
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
						updateCountryCode={ updateCountryCode }
						updatePostalCode={ updatePostalCode }
						CountrySelectMenu={ CountrySelectMenu }
						countriesList={ countriesList }
					/>
					{ requiresVatId && <VatIdField /> }
				</React.Fragment>
			);
	}
}
