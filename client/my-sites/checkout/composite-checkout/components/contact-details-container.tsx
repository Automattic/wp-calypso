/**
 * External dependencies
 */
import React from 'react';
import { useSelect, useDispatch } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { useShoppingCart } from '@automattic/shopping-cart';
import type { ContactDetailsType, ManagedContactDetails } from '@automattic/wpcom-checkout';
import type { DomainContactDetails as DomainContactDetailsData } from '@automattic/shopping-cart';
import { Field, styled } from '@automattic/wpcom-checkout';
import {
	isDomainProduct,
	isDomainTransfer,
	isDomainMapping,
	getDomain,
} from '@automattic/calypso-products';

/**
 * Internal dependencies
 */
import {
	prepareDomainContactDetails,
	prepareDomainContactDetailsErrors,
	isValid,
} from '../types/wpcom-store-state';
import type { CountryListItem } from '../types/country-list-item';
import TaxFields from './tax-fields';
import DomainContactDetails from './domain-contact-details';
import getCountries from 'calypso/state/selectors/get-countries';
import { useSelector } from 'react-redux';

const ContactDetailsFormDescription = styled.p`
	font-size: 14px;
	color: ${ ( props ) => props.theme.colors.textColor };
	margin: 0 0 16px;
`;

export default function ContactDetailsContainer( {
	contactDetailsType,
	contactInfo,
	countriesList,
	shouldShowContactDetailsValidationErrors,
	isDisabled,
	isLoggedOutCart,
}: {
	contactDetailsType: Exclude< ContactDetailsType, 'none' >;
	contactInfo: ManagedContactDetails;
	countriesList: CountryListItem[];
	shouldShowContactDetailsValidationErrors: boolean;
	isDisabled: boolean;
	isLoggedOutCart: boolean;
} ): JSX.Element {
	const translate = useTranslate();
	const { responseCart } = useShoppingCart();
	const domainNames: string[] = responseCart.products
		.filter( ( product ) => isDomainProduct( product ) || isDomainTransfer( product ) )
		.filter( ( product ) => ! isDomainMapping( product ) )
		.map( getDomain );
	const {
		updateDomainContactFields,
		updateCountryCode,
		updatePostalCode,
		updateRequiredDomainFields,
		updateEmail,
	} = useDispatch( 'wpcom' );
	const contactDetails = prepareDomainContactDetails( contactInfo );
	const contactDetailsErrors = prepareDomainContactDetailsErrors( contactInfo );
	const { email } = useSelect( ( select ) => select( 'wpcom' ).getContactInfo() );
	const countries = useSelector( ( state ) => getCountries( state, 'domains' ) );

	const updateDomainContactRelatedData = ( details: DomainContactDetailsData ) => {
		updateDomainContactFields( details );
		updateRequiredDomainFields( {
			postalCode:
				countries?.find( ( country ) => country.code === details.countryCode )?.has_postal_codes ??
				true,
		} );
	};

	switch ( contactDetailsType ) {
		case 'domain':
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
						updateDomainContactFields={ updateDomainContactRelatedData }
						shouldShowContactDetailsValidationErrors={ shouldShowContactDetailsValidationErrors }
						isDisabled={ isDisabled }
						isLoggedOutCart={ isLoggedOutCart }
					/>
				</React.Fragment>
			);

		case 'gsuite':
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

		default:
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
}
