/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import EmailProvidersComparison from 'calypso/my-sites/email/email-providers-comparison';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';

export default function EmailProvidersUpsell( { domain } ) {
	return (
		<>
			<CalypsoShoppingCartProvider>
				<EmailProvidersComparison
					selectedDomainName={ domain }
					isEmailForwardingCardShown={ false }
					isEmailHeaderShown={ false }
				/>
			</CalypsoShoppingCartProvider>
		</>
	);
}
