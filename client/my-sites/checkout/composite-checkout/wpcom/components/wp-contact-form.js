/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import {
	useSelect,
	useDispatch,
	useFormStatus,
	useIsStepActive,
	useLineItems,
} from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { useDomainNamesInCart } from '../hooks/has-domains';
import Field from './field';
import { LeftColumn, RightColumn } from './ie-fallback';
import { prepareDomainContactDetails, prepareDomainContactDetailsErrors, isValid } from '../types';
import { isGSuiteProductSlug } from 'lib/gsuite';
import useSkipToLastStepIfFormComplete from '../hooks/use-skip-to-last-step-if-form-complete';
import useIsCachedContactFormValid from '../hooks/use-is-cached-contact-form-valid';
import CountrySelectMenu from './country-select-menu';

export default function WPContactForm( {
	countriesList,
	renderDomainContactFields,
	shouldShowContactDetailsValidationErrors,
	shouldShowDomainContactFields,
	contactValidationCallback,
} ) {
	const translate = useTranslate();
	const [ items ] = useLineItems();
	const isGSuiteInCart = items.some( ( item ) =>
		isGSuiteProductSlug( item.wpcom_meta?.product_slug )
	);
	const contactInfo = useSelect( ( select ) => select( 'wpcom' ).getContactInfo() );
	const { formStatus } = useFormStatus();
	const isStepActive = useIsStepActive();
	const isDisabled = ! isStepActive || formStatus !== 'ready';
	const isCachedContactFormValid = useIsCachedContactFormValid( contactValidationCallback );

	useSkipToLastStepIfFormComplete( isCachedContactFormValid );

	return (
		<BillingFormFields>
			<RenderContactDetails
				translate={ translate }
				shouldShowDomainContactFields={ shouldShowDomainContactFields }
				isGSuiteInCart={ isGSuiteInCart }
				contactInfo={ contactInfo }
				renderDomainContactFields={ renderDomainContactFields }
				countriesList={ countriesList }
				shouldShowContactDetailsValidationErrors={ shouldShowContactDetailsValidationErrors }
				isDisabled={ isDisabled }
			/>
		</BillingFormFields>
	);
}

const BillingFormFields = styled.div`
	margin-bottom: 16px;

	.form-input-validation {
		padding: 6px 6px 11px;
	}

	.form-input-validation .gridicon {
		float: none;
		margin-left: 0;
		width: 18px;
		vertical-align: text-top;
		height: 18px;
	}
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
	const { vatId } = useSelect( ( select ) => select( 'wpcom' ).getContactInfo() );
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
	countriesList,
	updatePostalCode,
	updateCountryCode,
	isDisabled,
} ) {
	const translate = useTranslate();
	const { postalCode, countryCode } = taxInfo;

	return (
		<FieldRow>
			<LeftColumn>
				<Field
					id={ section + '-postal-code' }
					type="text"
					label={ translate( 'Postal code' ) }
					value={ postalCode.value }
					disabled={ isDisabled }
					onChange={ ( value ) => {
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
					onChange={ ( event ) => {
						updateCountryCode( event.target.value );
					} }
					isError={ countryCode.isTouched && ! isValid( countryCode ) }
					isDisabled={ isDisabled }
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
	isDisabled: PropTypes.bool,
};

function RenderContactDetails( {
	translate,
	shouldShowDomainContactFields,
	isGSuiteInCart,
	contactInfo,
	renderDomainContactFields,
	countriesList,
	shouldShowContactDetailsValidationErrors,
	isDisabled,
} ) {
	const requiresVatId = isEligibleForVat( contactInfo.countryCode.value );
	const domainNames = useDomainNamesInCart();
	const { updateDomainContactFields, updateCountryCode, updatePostalCode } = useDispatch( 'wpcom' );

	if ( shouldShowDomainContactFields ) {
		return (
			<React.Fragment>
				<ContactDetailsFormDescription>
					{ translate(
						'Registering a domain name requires valid contact information. Privacy Protection is included for all eligible domains to protect your personal information.'
					) }
				</ContactDetailsFormDescription>
				{ renderDomainContactFields(
					domainNames,
					prepareDomainContactDetails( contactInfo ),
					prepareDomainContactDetailsErrors( contactInfo ),
					updateDomainContactFields,
					shouldShowContactDetailsValidationErrors,
					isDisabled
				) }
				{ requiresVatId && <VatIdField /> }
			</React.Fragment>
		);
	}

	if ( isGSuiteInCart ) {
		return (
			<React.Fragment>
				{ renderDomainContactFields(
					domainNames,
					prepareDomainContactDetails( contactInfo ),
					prepareDomainContactDetailsErrors( contactInfo ),
					updateDomainContactFields,
					shouldShowContactDetailsValidationErrors,
					isDisabled
				) }
				{ requiresVatId && <VatIdField /> }
			</React.Fragment>
		);
	}

	return (
		<React.Fragment>
			<ContactDetailsFormDescription>
				{ translate( 'Entering your billing information helps us prevent fraud.' ) }
			</ContactDetailsFormDescription>
			<TaxFields
				section="contact"
				taxInfo={ contactInfo }
				updateCountryCode={ updateCountryCode }
				updatePostalCode={ updatePostalCode }
				countriesList={ countriesList }
				isDisabled={ isDisabled }
			/>
			{ requiresVatId && <VatIdField /> }
		</React.Fragment>
	);
}

const ContactDetailsFormDescription = styled.p`
	font-size: 14px;
	color: ${ ( props ) => props.theme.colors.textColor };
	margin: 0 0 16px;
`;
