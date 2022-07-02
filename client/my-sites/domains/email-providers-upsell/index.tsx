import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import EmailProvidersStackedComparison from 'calypso/my-sites/email/email-providers-stacked-comparison';

interface EmailProvidersUpsellProps {
	domain: string;
	interval?: IntervalLength;
	provider: string;
}

const EmailProvidersUpsell = ( { domain, interval, provider }: EmailProvidersUpsellProps ) => (
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

export default EmailProvidersUpsell;
