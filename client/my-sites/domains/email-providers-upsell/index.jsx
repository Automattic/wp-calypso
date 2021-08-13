/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { domainAddNew } from 'calypso/my-sites/domains/paths';
import EmailProvidersComparison from 'calypso/my-sites/email/email-providers-comparison';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export default function EmailProvidersUpsell( { domain } ) {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	const comment = '%(domainName)s is the domain name, e.g example.com';

	return (
		<CalypsoShoppingCartProvider>
			<EmailProvidersComparison
				backPath={ domainAddNew( selectedSiteSlug ) }
				cartDomainName={ domain }
				headerTitle={ translate( 'Register %(domainName)s', {
					args: { domainName: domain },
					comment,
				} ) }
				hideEmailHeader
				hideEmailForwardingCard
				isSkippable
				onSkipClick={ () => {
					page( `/checkout/${ selectedSiteSlug }` );
				} }
				promoHeaderTitle={ translate( 'Add a professional email address to %(domainName)s', {
					args: {
						domainName: domain,
					},
					comment,
				} ) }
				promoHeaderDescription={ translate(
					'Pick one of our flexible options to connect your domain with email and start getting emails @%(domainName)s today.',
					{
						args: {
							domainName: domain,
						},
						comment,
					}
				) }
				selectedDomainName={ domain }
			/>
		</CalypsoShoppingCartProvider>
	);
}
