import { isGoogleWorkspaceMonthly } from '@automattic/calypso-products';
import { ResponseDomain } from 'calypso/lib/domains/types';
import {
	getGSuiteExpiryDate,
	getGSuiteMailboxPurchaseCost,
	getGSuiteMailboxRenewalCost,
} from 'calypso/lib/gsuite';
import {
	getTitanExpiryDate,
	getTitanMailboxPurchaseCost,
	getTitanMailboxRenewalCost,
	isTitanMonthlyProduct,
} from 'calypso/lib/titan';
import EmailPricingNotice from 'calypso/my-sites/email/email-pricing-notice';
import { getMailProductProperties } from 'calypso/my-sites/email/form/mailboxes/components/utilities/get-mail-product-properties';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

interface ProviderPricingNoticeProps {
	emailProduct: ProductListItem | null;
	provider: EmailProvider;
	selectedDomain: ResponseDomain;
}

export const EmailProviderPricingNotice = ( {
	emailProduct,
	provider,
	selectedDomain,
}: ProviderPricingNoticeProps ): JSX.Element | null => {
	const { isAdditionalMailboxesPurchase } = getMailProductProperties(
		provider,
		selectedDomain,
		emailProduct as ProductListItem
	);

	if ( ! selectedDomain || ! emailProduct || ! isAdditionalMailboxesPurchase ) {
		return null;
	}

	if ( provider === EmailProvider.Titan ) {
		return (
			<EmailPricingNotice
				domain={ selectedDomain }
				expiryDate={ getTitanExpiryDate( selectedDomain ) }
				mailboxRenewalCost={ getTitanMailboxRenewalCost( selectedDomain ) }
				mailboxPurchaseCost={ getTitanMailboxPurchaseCost( selectedDomain ) }
				product={ emailProduct }
				isMonthlyBilling={ isTitanMonthlyProduct( emailProduct ) }
			/>
		);
	}

	return (
		<EmailPricingNotice
			domain={ selectedDomain }
			expiryDate={ getGSuiteExpiryDate( selectedDomain ) }
			mailboxRenewalCost={ getGSuiteMailboxRenewalCost( selectedDomain ) }
			mailboxPurchaseCost={ getGSuiteMailboxPurchaseCost( selectedDomain ) }
			product={ emailProduct }
			isMonthlyBilling={ isGoogleWorkspaceMonthly( emailProduct ) }
		/>
	);
};

export default EmailProviderPricingNotice;
