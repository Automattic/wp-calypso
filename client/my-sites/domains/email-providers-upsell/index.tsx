import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import EmailProvidersStackedComparison from 'calypso/my-sites/email/email-providers-comparison/stacked';
import type { Context } from '@automattic/calypso-router';

interface EmailProvidersUpsellProps {
	context: Context;
	selectedDomainName: string;
	selectedEmailProviderSlug: string;
	selectedIntervalLength?: IntervalLength;
}

const EmailProvidersUpsell = ( {
	context,
	selectedDomainName,
	selectedEmailProviderSlug,
	selectedIntervalLength,
}: EmailProvidersUpsellProps ) => (
	<CalypsoShoppingCartProvider>
		<EmailProvidersStackedComparison
			comparisonContext="domain-upsell"
			isDomainInCart
			selectedDomainName={ selectedDomainName }
			selectedEmailProviderSlug={ selectedEmailProviderSlug }
			selectedIntervalLength={ selectedIntervalLength }
			source="domain-upsell"
			context={ context }
		/>
	</CalypsoShoppingCartProvider>
);

export default EmailProvidersUpsell;
