/**
 * External dependencies
 */
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import {
	useSelect,
	useDispatch,
	useFormStatus,
	useIsStepActive,
	useLineItems,
	useSetStepComplete,
} from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { useHasDomainsInCart, useDomainNamesInCart } from '../hooks/has-domains';
import Field from './field';
import { SummaryLine, SummaryDetails } from './summary-details';
import { LeftColumn, RightColumn } from './ie-fallback';
import { prepareDomainContactDetails, prepareDomainContactDetailsErrors, isValid } from '../types';
import getContactDetailsCache from 'state/selectors/get-contact-details-cache';
import { isGSuiteProductSlug } from 'lib/gsuite';

const debug = debugFactory( 'calypso:composite-checkout:wp-contact-form' );

export default function WPContactForm( {
	summary,
	isComplete,
	isActive,
	CountrySelectMenu,
	countriesList,
	renderDomainContactFields,
	shouldShowContactDetailsValidationErrors,
	contactValidationCallback,
} ) {
	const translate = useTranslate();
	const [ items ] = useLineItems();
	const isDomainFieldsVisible = useHasDomainsInCart();
	const isGSuiteInCart = items.some( ( item ) =>
		isGSuiteProductSlug( item.wpcom_meta?.product_slug )
	);
	const contactInfo = useSelect( ( select ) => select( 'wpcom' ).getContactInfo() );
	const { formStatus } = useFormStatus();
	const isStepActive = useIsStepActive();
	const isDisabled = ! isStepActive || formStatus !== 'ready';
	useSkipToLastStepIfFormComplete( contactValidationCallback );

	if ( summary && isComplete ) {
		return (
			<ContactFormSummary
				isDomainFieldsVisible={ isDomainFieldsVisible }
				isGSuiteInCart={ isGSuiteInCart }
			/>
		);
	}
	if ( ! isActive ) {
		return null;
	}

	return (
		<BillingFormFields>
			<RenderContactDetails
				translate={ translate }
				isDomainFieldsVisible={ isDomainFieldsVisible }
				isGSuiteInCart={ isGSuiteInCart }
				contactInfo={ contactInfo }
				renderDomainContactFields={ renderDomainContactFields }
				CountrySelectMenu={ CountrySelectMenu }
				countriesList={ countriesList }
				shouldShowContactDetailsValidationErrors={ shouldShowContactDetailsValidationErrors }
				isDisabled={ isDisabled }
			/>
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
	CountrySelectMenu,
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

function ContactFormSummary( { isDomainFieldsVisible, isGSuiteInCart } ) {
	const translate = useTranslate();
	const contactInfo = useSelect( ( select ) => select( 'wpcom' ).getContactInfo() );

	const showDomainContactSummary = isDomainFieldsVisible;

	// Check if paymentData is empty
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
					{ ( isGSuiteInCart || showDomainContactSummary ) && fullName && (
						<SummaryLine>{ fullName }</SummaryLine>
					) }

					{ showDomainContactSummary && contactInfo.organization.value?.length > 0 && (
						<SummaryLine>{ contactInfo.organization.value } </SummaryLine>
					) }

					{ showDomainContactSummary && contactInfo.email.value?.length > 0 && (
						<SummaryLine>{ contactInfo.email.value }</SummaryLine>
					) }

					<AlternateEmailSummary
						contactInfo={ contactInfo }
						showDomainContactSummary={ showDomainContactSummary }
						isGSuiteInCart={ isGSuiteInCart }
					/>

					{ showDomainContactSummary && contactInfo.phone.value?.length > 0 && (
						<SummaryLine>{ contactInfo.phone.value }</SummaryLine>
					) }
				</SummaryDetails>

				<SummaryDetails>
					{ showDomainContactSummary && contactInfo.address1.value?.length > 0 && (
						<SummaryLine>{ contactInfo.address1.value } </SummaryLine>
					) }

					{ showDomainContactSummary && contactInfo.address2.value?.length > 0 && (
						<SummaryLine>{ contactInfo.address2.value } </SummaryLine>
					) }

					{ showDomainContactSummary && cityAndState && (
						<SummaryLine>{ cityAndState }</SummaryLine>
					) }

					{ postalAndCountry && <SummaryLine>{ postalAndCountry }</SummaryLine> }
				</SummaryDetails>

				{ contactInfo.vatId.value?.length > 0 && (
					<SummaryDetails>
						{ contactInfo.vatId.value?.length > 0 && (
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
	return values.filter( ( value ) => value?.length > 0 ).join( joinString );
}

function RenderContactDetails( {
	translate,
	isDomainFieldsVisible,
	isGSuiteInCart,
	contactInfo,
	renderDomainContactFields,
	CountrySelectMenu,
	countriesList,
	shouldShowContactDetailsValidationErrors,
	isDisabled,
} ) {
	const requiresVatId = isEligibleForVat( contactInfo.countryCode.value );
	const domainNames = useDomainNamesInCart();
	const { updateDomainContactFields, updateCountryCode, updatePostalCode } = useDispatch( 'wpcom' );

	if ( isDomainFieldsVisible ) {
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
				CountrySelectMenu={ CountrySelectMenu }
				countriesList={ countriesList }
				isDisabled={ isDisabled }
			/>
			{ requiresVatId && <VatIdField /> }
		</React.Fragment>
	);
}

function AlternateEmailSummary( { contactInfo, showDomainContactSummary, isGSuiteInCart } ) {
	if ( ! isGSuiteInCart && ! showDomainContactSummary ) {
		return null;
	}
	if ( ! contactInfo.alternateEmail.value?.length ) {
		return null;
	}
	if ( contactInfo.alternateEmail.value === contactInfo.email.value && showDomainContactSummary ) {
		return null;
	}
	return <SummaryLine>{ contactInfo.alternateEmail.value }</SummaryLine>;
}

const ContactDetailsFormDescription = styled.p`
	font-size: 14px;
	color: ${ ( props ) => props.theme.colors.textColor };
	margin: 0 0 16px;
`;

function useSkipToLastStepIfFormComplete( contactValidationCallback ) {
	const cachedContactDetails = useSelector( getContactDetailsCache );
	const shouldValidateCachedContactDetails = useRef( true );
	const shouldResetFormStatus = useRef( false );
	const setStepCompleteStatus = useSetStepComplete();
	const { formStatus, setFormValidating, setFormReady } = useFormStatus();

	useEffect( () => {
		if ( ! contactValidationCallback ) {
			debug( 'Cannot validate contact details; no validation callback' );
			return;
		}
		if ( shouldValidateCachedContactDetails.current && cachedContactDetails ) {
			shouldValidateCachedContactDetails.current = false;
			if ( formStatus === 'ready' ) {
				setFormValidating();
				shouldResetFormStatus.current = true;
			}
			contactValidationCallback()
				.then( ( areDetailsCompleteAndValid ) => {
					// If the details are already populated and valid, jump to payment method step
					if ( areDetailsCompleteAndValid ) {
						debug( 'Contact details are already populated; skipping to payment method step' );
						saveStepNumberToUrl( 2 ); // TODO: can we do this dynamically somehow in case the step numbers change?
						setStepCompleteStatus( 1, true ); // TODO: can we do this dynamically somehow in case the step numbers change?
					} else {
						debug( 'Contact details are already populated but not valid' );
					}
					if ( shouldResetFormStatus.current ) {
						setFormReady();
					}
				} )
				.catch( () => {
					if ( shouldResetFormStatus.current ) {
						setFormReady();
					}
				} );
		}
	}, [
		formStatus,
		setFormReady,
		setFormValidating,
		cachedContactDetails,
		contactValidationCallback,
		setStepCompleteStatus,
	] );
}

function saveStepNumberToUrl( stepNumber ) {
	if ( ! window?.history || ! window?.location ) {
		return;
	}
	const newHash = stepNumber > 1 ? `#step${ stepNumber }` : '';
	if ( window.location.hash === newHash ) {
		return;
	}
	const newUrl = window.location.hash
		? window.location.href.replace( window.location.hash, newHash )
		: window.location.href + newHash;
	debug( 'updating url to', newUrl );
	window.history.replaceState( null, '', newUrl );
	// Modifying history does not trigger a hashchange event which is what
	// composite-checkout uses to change its current step, so we must fire one
	// manually. (HashChangeEvent is part of the web API so I'm not sure why
	// eslint reports this as undefined.)
	const event = new HashChangeEvent( 'hashchange' ); // eslint-disable-line no-undef
	window.dispatchEvent( event );
}
