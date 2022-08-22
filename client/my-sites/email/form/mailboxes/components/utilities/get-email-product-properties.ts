import { ResponseDomain } from 'calypso/lib/domains/types';
import { getGSuiteMailboxCount, hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { getMaxTitanMailboxCount, hasTitanMailWithUs } from 'calypso/lib/titan';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

type EmailProperties = {
	existingItemsCount: number;
	isAdditionalMailboxesPurchase: boolean;
	emailProduct: ProductListItem | undefined | null;
	newQuantity: number | undefined;
	quantity: number;
};

const getEmailProductProperties = (
	provider: EmailProvider,
	domain: ResponseDomain,
	emailProduct: ProductListItem,
	newMailboxesCount = 1
): EmailProperties => {
	const isTitanProvider = provider === EmailProvider.Titan;
	const isAdditionalMailboxesPurchase = isTitanProvider
		? hasTitanMailWithUs( domain )
		: hasGSuiteWithUs( domain );

	const existingItemsCount = isTitanProvider
		? getMaxTitanMailboxCount( domain )
		: getGSuiteMailboxCount( domain );

	const quantity = isAdditionalMailboxesPurchase
		? existingItemsCount + newMailboxesCount
		: newMailboxesCount;

	return {
		existingItemsCount,
		isAdditionalMailboxesPurchase,
		emailProduct,
		newQuantity: newMailboxesCount,
		quantity,
	};
};

export { getEmailProductProperties };
export type { EmailProperties };
