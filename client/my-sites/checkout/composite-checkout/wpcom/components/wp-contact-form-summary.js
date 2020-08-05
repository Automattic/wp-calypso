/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import { useSelect, useLineItems } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { SummaryLine, SummaryDetails } from './summary-details';
import { isGSuiteProductSlug } from 'lib/gsuite';

export default function WPContactFormSummary( { showDomainContactSummary } ) {
	const [ items ] = useLineItems();
	const isGSuiteInCart = items.some( ( item ) =>
		isGSuiteProductSlug( item.wpcom_meta?.product_slug )
	);
	const contactInfo = useSelect( ( select ) => select( 'wpcom' ).getContactInfo() );

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
			</div>
		</GridRow>
	);
}

const GridRow = styled.div`
	display: -ms-grid;
	display: grid;
	width: 100%;
	-ms-grid-columns: 48% 4% 48%;
	grid-template-columns: 48% 48%;
	grid-column-gap: 4%;
	justify-items: stretch;
`;

function joinNonEmptyValues( joinString, ...values ) {
	return values.filter( ( value ) => value?.length > 0 ).join( joinString );
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
