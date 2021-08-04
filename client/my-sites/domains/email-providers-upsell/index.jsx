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
import EmailProvidersComparison from 'calypso/my-sites/email/email-providers-comparison';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export default function EmailProvidersUpsell( { domain } ) {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	const comment = '%(domainName)s is the domain name, e.g example.com';

	return (
		<>
			<CalypsoShoppingCartProvider>
				<EmailProvidersComparison
					selectedDomainName={ domain }
					isEmailForwardingCardShown={ false }
					isEmailHeaderShown={ false }
					headerTitle={ ( domainName ) =>
						translate( 'Register %(domainName)s', { args: { domainName }, comment } )
					}
					promoHeaderTitle={ ( domainName ) =>
						translate( 'Add a professional email address to %(domainName)s', {
							args: {
								domainName,
							},
							comment,
						} )
					}
					promoHeaderDescription={ ( domainName ) =>
						translate(
							'Pick from one of our flexible options to connect your domain with email and start getting emails @%(domainName)s today.',
							{
								args: {
									domainName,
								},
								comment,
							}
						)
					}
					isSkippable
					onSkipClick={ () => {
						page( `/checkout/${ selectedSiteSlug }` );
					} }
				/>
			</CalypsoShoppingCartProvider>
		</>
	);
}
