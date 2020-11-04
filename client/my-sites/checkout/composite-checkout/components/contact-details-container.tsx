/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import { useSelect, useDispatch } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { useDomainNamesInCart } from '../hooks/has-domains';
import Field from './field';
import {
	prepareDomainContactDetails,
	prepareDomainContactDetailsErrors,
	isValid,
} from '../types/wpcom-store-state';
import type { CountryListItem } from '../types/country-list-item';
import type { ManagedContactDetails } from '../types/wpcom-store-state';
import TaxFields from './tax-fields';
import DomainContactDetails from './domain-contact-details';

const ContactDetailsFormDescription = styled.p`
	font-size: 14px;
	color: ${ ( props ) => props.theme.colors.textColor };
	margin: 0 0 16px;
`;

export default function ContactDetailsContainer( {
	shouldShowDomainContactFields,
	isGSuiteInCart,
	contactInfo,
	countriesList,
	shouldShowContactDetailsValidationErrors,
	isDisabled,
	isLoggedOutCart,
}: {
	shouldShowDomainContactFields: boolean;
	isGSuiteInCart: boolean;
	contactInfo: ManagedContactDetails;
	countriesList: CountryListItem[];
	shouldShowContactDetailsValidationErrors: boolean;
	isDisabled: boolean;
	isLoggedOutCart: boolean;
} ): JSX.Element {
	const translate = useTranslate();
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
				isLoggedOutCart={ isLoggedOutCart }
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
					label={ String( translate( 'Email' ) ) }
					disabled={ isDisabled }
					onChange={ ( value ) => {
						updateEmail( value );
					} }
					autoComplete="email"
					isError={ email.isTouched && ! isValid( email ) }
					errorMessage={ email.errors[ 0 ] || '' }
					description={ String(
						translate( "You'll use this email address to access your account later" )
					) }
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
