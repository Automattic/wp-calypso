import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import EmailProvidersStackedComparison from 'calypso/my-sites/email/email-providers-comparison/stacked';

export default function EmailProvidersUpsell( { domain, interval, provider } ) {
	return (
		<CalypsoShoppingCartProvider>
			<EmailProvidersStackedComparison
				comparisonContext="domain-upsell"
				isDomainInCart={ true }
				selectedDomainName={ domain }
				selectedEmailProviderSlug={ provider }
				selectedIntervalLength={ interval }
				source="domain-upsell"
			/>
		</CalypsoShoppingCartProvider>
	);
}
