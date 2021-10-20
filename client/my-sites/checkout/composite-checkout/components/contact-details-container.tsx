import {
	isDomainProduct,
	isDomainTransfer,
	isDomainMapping,
	getDomain,
} from '@automattic/calypso-products';
import { useShoppingCart } from '@automattic/shopping-cart';
import { Field, styled } from '@automattic/wpcom-checkout';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import {
	prepareDomainContactDetails,
	prepareDomainContactDetailsErrors,
	isValid,
} from '../types/wpcom-store-state';
import DomainContactDetails from './domain-contact-details';
import TaxFields from './tax-fields';
import type { DomainContactDetails as DomainContactDetailsData } from '@automattic/shopping-cart';
import type {
	CountryListItem,
	ContactDetailsType,
	ManagedContactDetails,
} from '@automattic/wpcom-checkout';

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
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const domainNames: string[] = responseCart.products
		.filter( ( product ) => isDomainProduct( product ) || isDomainTransfer( product ) )
		.filter( ( product ) => ! isDomainMapping( product ) )
		.map( getDomain );
	const {
		updateDomainContactFields,
		updateCountryCode,
		updatePostalCode,
		updateEmail,
	} = useDispatch( 'wpcom-checkout' );
	const contactDetails = prepareDomainContactDetails( contactInfo );
	const contactDetailsErrors = prepareDomainContactDetailsErrors( contactInfo );
	const { email } = useSelect( ( select ) => select( 'wpcom-checkout' ).getContactInfo() );

	const updateDomainContactRelatedData = ( details: DomainContactDetailsData ) => {
		updateDomainContactFields( details );
	};

	switch ( contactDetailsType ) {
		case 'domain':
			return (
				<Fragment>
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
				</Fragment>
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
				<Fragment>
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
				</Fragment>
			);
	}
}
