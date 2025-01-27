import {
	isDomainProduct,
	isDomainTransfer,
	isDomainMapping,
	getDomain,
} from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { useShoppingCart } from '@automattic/shopping-cart';
import { Field, styled } from '@automattic/wpcom-checkout';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
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

const NewAccountCreationDisclaimer = styled.p`
	font-size: 12px;
	color: ${ ( props ) => props.theme.colors.textColorLight };
	margin: 16px 0 0;
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
} ) {
	const translate = useTranslate();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const domainNames: string[] = responseCart.products
		.filter( ( product ) => isDomainProduct( product ) || isDomainTransfer( product ) )
		.filter( ( product ) => ! isDomainMapping( product ) )
		.map( getDomain );
	const checkoutActions = useDispatch( CHECKOUT_STORE );
	const { email } = useSelect( ( select ) => select( CHECKOUT_STORE ).getContactInfo(), [] );

	if ( ! checkoutActions ) {
		return null;
	}

	const { updateDomainContactFields, updateTaxFields, updateEmail } = checkoutActions;
	const contactDetails = prepareDomainContactDetails( contactInfo );
	const contactDetailsErrors = prepareDomainContactDetailsErrors( contactInfo );
	const onChangeContactInfo = ( newInfo: ManagedContactDetails ) => {
		updateTaxFields( newInfo );
	};

	const updateDomainContactRelatedData = ( details: DomainContactDetailsData ) => {
		updateDomainContactFields( details );
	};

	switch ( contactDetailsType ) {
		case 'domain':
			return (
				<Fragment>
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
							value={ contactDetails.email ?? '' }
							onChange={ ( value ) => {
								updateEmail( value );
							} }
							autoComplete="email"
							isError={ email?.isTouched && ! isValid( email ) }
							errorMessage={ email?.errors[ 0 ] || '' }
							description={ String(
								translate( "You'll use this email address to access your account later" )
							) }
						/>
					) }

					<TaxFields
						section="contact"
						taxInfo={ contactInfo }
						onChange={ onChangeContactInfo }
						countriesList={ countriesList }
						isDisabled={ isDisabled }
						allowVat
					/>
					{ /* For Jetpack and Akismet - we want to inform users that by continuing checkout process they create WordPress.com account */ }
					{ ( isJetpackCheckout() || isAkismetCheckout() ) && isLoggedOutCart && (
						<NewAccountCreationDisclaimer>
							{ translate(
								'%(serviceName)s is powered by WordPress.com. If you don’t already have a WordPress.com account, checking out below will create one for you with this email address. Accounts are subject to the {{tosLink}}Terms of Service{{/tosLink}} and {{ppLink}}Privacy Policy{{/ppLink}}.',
								{
									components: {
										tosLink: (
											<a
												href={ localizeUrl( 'https://wordpress.com/tos/' ) }
												target="_blank"
												rel="noreferrer"
											/>
										),
										ppLink: (
											<a
												href={ localizeUrl( 'https://automattic.com/privacy' ) }
												target="_blank"
												rel="noreferrer"
											/>
										),
									},
									args: {
										serviceName: isJetpackCheckout() ? 'Jetpack' : 'Akismet',
									},
								}
							) }
						</NewAccountCreationDisclaimer>
					) }
				</Fragment>
			);
	}
}
