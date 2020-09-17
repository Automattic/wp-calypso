/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import { useSelect } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { SummaryLine, SummaryDetails } from './summary-details';
import { useCart } from 'my-sites/checkout/composite-checkout/cart-provider';
import { hasOnlyRenewalItems } from 'lib/cart-values/cart-items';

export default function WPContactFormSummary( {
	areThereDomainProductsInCart,
	isGSuiteInCart,
	isLoggedOutCart,
} ) {
	const contactInfo = useSelect( ( select ) => select( 'wpcom' ).getContactInfo() );
	const cart = useCart();
	const isRenewal = cart && hasOnlyRenewalItems( cart );

	// Check if paymentData is empty
	if ( Object.entries( contactInfo ).length === 0 ) {
		return null;
	}

	const fullName = joinNonEmptyValues(
		' ',
		contactInfo.firstName.value,
		contactInfo.lastName.value
	);

	return (
		<GridRow>
			<div>
				<SummaryDetails>
					{ ! isRenewal && ( isGSuiteInCart || areThereDomainProductsInCart ) && fullName && (
						<SummaryLine>{ fullName }</SummaryLine>
					) }

					{ ! isRenewal &&
						areThereDomainProductsInCart &&
						contactInfo.organization.value?.length > 0 && (
							<SummaryLine>{ contactInfo.organization.value } </SummaryLine>
						) }

					<EmailSummary
						isRenewal={ isRenewal }
						isLoggedOutCart={ isLoggedOutCart }
						contactInfo={ contactInfo }
						areThereDomainProductsInCart={ areThereDomainProductsInCart }
						isGSuiteInCart={ isGSuiteInCart }
					/>

					{ ! isRenewal && areThereDomainProductsInCart && contactInfo.phone.value?.length > 0 && (
						<SummaryLine>{ contactInfo.phone.value }</SummaryLine>
					) }
				</SummaryDetails>

				<AddressSummary
					isRenewal={ isRenewal }
					contactInfo={ contactInfo }
					areThereDomainProductsInCart={ areThereDomainProductsInCart }
				/>
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

function EmailSummary( {
	isRenewal,
	contactInfo,
	areThereDomainProductsInCart,
	isGSuiteInCart,
	isLoggedOutCart,
} ) {
	if ( isRenewal ) {
		return null;
	}
	if ( ! areThereDomainProductsInCart && ! isGSuiteInCart && ! isLoggedOutCart ) {
		return null;
	}

	if ( ! contactInfo.alternateEmail.value && ! contactInfo.email.value ) {
		return null;
	}

	if ( isGSuiteInCart && ! areThereDomainProductsInCart ) {
		return <SummaryLine>{ contactInfo.alternateEmail.value }</SummaryLine>;
	}

	if ( isGSuiteInCart && contactInfo.alternateEmail.value ) {
		return <SummaryLine>{ contactInfo.alternateEmail.value }</SummaryLine>;
	}

	if ( ! contactInfo.email.value ) {
		return null;
	}

	return <SummaryLine>{ contactInfo.email.value }</SummaryLine>;
}

function AddressSummary( { contactInfo, areThereDomainProductsInCart, isRenewal } ) {
	const postalAndCountry = joinNonEmptyValues(
		', ',
		contactInfo.postalCode.value,
		contactInfo.countryCode.value
	);

	if ( ! areThereDomainProductsInCart || isRenewal ) {
		return (
			<SummaryDetails>
				{ postalAndCountry && <SummaryLine>{ postalAndCountry }</SummaryLine> }
			</SummaryDetails>
		);
	}

	const cityAndState = joinNonEmptyValues( ', ', contactInfo.city.value, contactInfo.state.value );
	return (
		<SummaryDetails>
			{ contactInfo.address1.value?.length > 0 && (
				<SummaryLine>{ contactInfo.address1.value } </SummaryLine>
			) }

			{ contactInfo.address2.value?.length > 0 && (
				<SummaryLine>{ contactInfo.address2.value } </SummaryLine>
			) }

			{ cityAndState && <SummaryLine>{ cityAndState }</SummaryLine> }

			{ postalAndCountry && <SummaryLine>{ postalAndCountry }</SummaryLine> }
		</SummaryDetails>
	);
}
