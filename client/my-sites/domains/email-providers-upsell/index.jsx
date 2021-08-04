/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmailProvidersComparison from 'calypso/my-sites/email/email-providers-comparison';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';

export default function EmailProvidersUpsell( { domain } ) {
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
						translate( `Add a professional email address to %(domainName)s`, {
							args: {
								domainName,
							},
							comment,
						} )
					}
					headerDescription={ ( domainName ) =>
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
				/>
			</CalypsoShoppingCartProvider>
		</>
	);
}
