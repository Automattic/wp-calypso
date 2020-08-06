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
import {
	hasGoogleApps,
	hasDomainRegistration,
	hasTransferProduct,
	needsExplicitAlternateEmailForGSuite,
} from 'lib/cart-values/cart-items';
import { useCart } from 'my-sites/checkout/composite-checkout/cart-provider';
import { getTopLevelOfTld } from 'lib/domains';
import ManagedContactDetailsFormFields from 'components/domains/contact-details-form-fields/managed-contact-details-form-fields';
import RegistrantExtraInfoForm from 'components/domains/registrant-extra-info';

export default function WPContactForm( {
	countriesList,
	shouldShowContactDetailsValidationErrors,
	shouldShowDomainContactFields,
	contactValidationCallback,
	isLoggedOutCart,
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
			<ContactDetailsContainer
				translate={ translate }
				shouldShowDomainContactFields={ shouldShowDomainContactFields }
				isGSuiteInCart={ isGSuiteInCart }
				contactInfo={ contactInfo }
				countriesList={ countriesList }
				shouldShowContactDetailsValidationErrors={ shouldShowContactDetailsValidationErrors }
				isDisabled={ isDisabled }
				isLoggedOutCart={ isLoggedOutCart }
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

function ContactDetailsContainer( {
	translate,
	shouldShowDomainContactFields,
	isGSuiteInCart,
	contactInfo,
	countriesList,
	shouldShowContactDetailsValidationErrors,
	isDisabled,
	isLoggedOutCart,
} ) {
	const domainNames = useDomainNamesInCart();
	const {
		updateDomainContactFields,
		updateCountryCode,
		updatePostalCode,
		updateEmail,
	} = useDispatch( 'wpcom' );
	const contactDetails = prepareDomainContactDetails( contactInfo );
	const contactDetailsErrors = prepareDomainContactDetailsErrors( contactInfo );
	const { email } = useSelect( ( select ) => select( 'wpcom' ).getContactInfo() );

	if ( shouldShowDomainContactFields ) {
		return (
			<React.Fragment>
				<ContactDetailsFormDescription>
					{ translate(
						'Registering a domain name requires valid contact information. Privacy Protection is included for all eligible domains to protect your personal information.'
					) }
				</ContactDetailsFormDescription>
				<DomainContactDetails
					domainNames={ domainNames }
					contactDetails={ contactDetails }
					contactDetailsErrors={ contactDetailsErrors }
					updateDomainContactFields={ updateDomainContactFields }
					shouldShowContactDetailsValidationErrors={ shouldShowContactDetailsValidationErrors }
					isDisabled={ isDisabled }
					isLoggedOutCart={ isLoggedOutCart }
				/>
			</React.Fragment>
		);
	}

	if ( isGSuiteInCart ) {
		return (
			<DomainContactDetails
				domainNames={ domainNames }
				contactDetails={ contactDetails }
				contactDetailsErrors={ contactDetailsErrors }
				updateDomainContactFields={ updateDomainContactFields }
				shouldShowContactDetailsValidationErrors={ shouldShowContactDetailsValidationErrors }
				isDisabled={ isDisabled }
			/>
		);
	}

	return (
		<React.Fragment>
			<ContactDetailsFormDescription>
				{ translate( 'Entering your billing information helps us prevent fraud.' ) }
			</ContactDetailsFormDescription>

			{ isLoggedOutCart && (
				<Field
					id="email"
					type="email"
					label={ translate( 'Email' ) }
					disabled={ isDisabled }
					onChange={ ( value ) => {
						updateEmail( value );
					} }
					autoComplete="email"
					isError={ email.isTouched && ! isValid( email ) }
					errorMessage={ email.errors[ 0 ] || '' }
					description={ translate( "You'll use this email address to access your account later" ) }
				/>
			) }

			<TaxFields
				section="contact"
				taxInfo={ contactInfo }
				updateCountryCode={ updateCountryCode }
				updatePostalCode={ updatePostalCode }
				countriesList={ countriesList }
				isDisabled={ isDisabled }
			/>
		</React.Fragment>
	);
}

function DomainContactDetails( {
	domainNames,
	contactDetails,
	contactDetailsErrors,
	updateDomainContactFields,
	shouldShowContactDetailsValidationErrors,
	isDisabled,
	isLoggedOutCart,
} ) {
	const translate = useTranslate();
	const responseCart = useCart();
	const needsOnlyGoogleAppsDetails =
		hasGoogleApps( responseCart ) &&
		! hasDomainRegistration( responseCart ) &&
		! hasTransferProduct( responseCart );
	const getIsFieldDisabled = () => isDisabled;
	const needsAlternateEmailForGSuite =
		needsOnlyGoogleAppsDetails &&
		needsExplicitAlternateEmailForGSuite( responseCart, contactDetails );
	const tlds = getAllTopLevelTlds( domainNames );

	return (
		<React.Fragment>
			<ManagedContactDetailsFormFields
				needsOnlyGoogleAppsDetails={ needsOnlyGoogleAppsDetails }
				needsAlternateEmailForGSuite={ needsAlternateEmailForGSuite }
				contactDetails={ contactDetails }
				contactDetailsErrors={
					shouldShowContactDetailsValidationErrors ? contactDetailsErrors : {}
				}
				onContactDetailsChange={ updateDomainContactFields }
				getIsFieldDisabled={ getIsFieldDisabled }
				isLoggedOutCart={ isLoggedOutCart }
			/>
			{ tlds.includes( 'ca' ) && (
				<RegistrantExtraInfoForm
					contactDetails={ contactDetails }
					ccTldDetails={ contactDetails?.extra?.ca ?? {} }
					onContactDetailsChange={ updateDomainContactFields }
					contactDetailsValidationErrors={
						shouldShowContactDetailsValidationErrors ? contactDetailsErrors : {}
					}
					tld={ 'ca' }
					getDomainNames={ () => domainNames }
					translate={ translate }
					isManaged={ true }
				/>
			) }
			{ tlds.includes( 'uk' ) && (
				<RegistrantExtraInfoForm
					contactDetails={ contactDetails }
					ccTldDetails={ contactDetails?.extra?.uk ?? {} }
					onContactDetailsChange={ updateDomainContactFields }
					contactDetailsValidationErrors={
						shouldShowContactDetailsValidationErrors ? contactDetailsErrors : {}
					}
					tld={ 'uk' }
					getDomainNames={ () => domainNames }
					translate={ translate }
					isManaged={ true }
				/>
			) }
			{ tlds.includes( 'fr' ) && (
				<RegistrantExtraInfoForm
					contactDetails={ contactDetails }
					ccTldDetails={ contactDetails?.extra?.fr ?? {} }
					onContactDetailsChange={ updateDomainContactFields }
					contactDetailsValidationErrors={
						shouldShowContactDetailsValidationErrors ? contactDetailsErrors : {}
					}
					tld={ 'fr' }
					getDomainNames={ () => domainNames }
					translate={ translate }
					isManaged={ true }
				/>
			) }
		</React.Fragment>
	);
}

const ContactDetailsFormDescription = styled.p`
	font-size: 14px;
	color: ${ ( props ) => props.theme.colors.textColor };
	margin: 0 0 16px;
`;

function getAllTopLevelTlds( domainNames ) {
	return Array.from( new Set( domainNames.map( getTopLevelOfTld ) ) ).sort();
}
