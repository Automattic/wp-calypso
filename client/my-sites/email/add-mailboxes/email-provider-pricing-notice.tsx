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
	mailProduct: ProductListItem | null;
	provider: EmailProvider;
	selectedDomain: ResponseDomain;
}

export const EmailProviderPricingNotice = ( {
	mailProduct,
	provider,
	selectedDomain,
}: ProviderPricingNoticeProps ): JSX.Element | null => {
	const { isExtraItemPurchase } = getMailProductProperties(
		provider,
		selectedDomain,
		mailProduct as ProductListItem
	);

	if ( ! selectedDomain || ! mailProduct || ! isExtraItemPurchase ) {
		return null;
	}

	if ( provider === EmailProvider.Titan ) {
		return (
			<EmailPricingNotice
				domain={ selectedDomain }
				expiryDate={ getTitanExpiryDate( selectedDomain ) }
				mailboxRenewalCost={ getTitanMailboxRenewalCost( selectedDomain ) }
				mailboxPurchaseCost={ getTitanMailboxPurchaseCost( selectedDomain ) }
				product={ mailProduct }
				isMonthlyBilling={ isTitanMonthlyProduct( mailProduct ) }
			/>
		);
	}

	return (
		<EmailPricingNotice
			domain={ selectedDomain }
			expiryDate={ getGSuiteExpiryDate( selectedDomain ) }
			mailboxRenewalCost={ getGSuiteMailboxRenewalCost( selectedDomain ) }
			mailboxPurchaseCost={ getGSuiteMailboxPurchaseCost( selectedDomain ) }
			product={ mailProduct }
			isMonthlyBilling={ isGoogleWorkspaceMonthly( mailProduct ) }
		/>
	);
};

export default EmailProviderPricingNotice;
