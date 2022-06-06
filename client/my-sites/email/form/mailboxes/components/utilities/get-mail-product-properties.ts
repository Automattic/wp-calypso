import { ResponseDomain } from 'calypso/lib/domains/types';
import { getGSuiteMailboxCount, hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { getMaxTitanMailboxCount, hasTitanMailWithUs } from 'calypso/lib/titan';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

type MailProperties = {
	isExtraItemPurchase: boolean;
	mailProduct: ProductListItem;
	newQuantity: number | undefined;
	quantity: number;
};

const getMailProductProperties = (
	provider: EmailProvider,
	domain: ResponseDomain,
	mailProduct: ProductListItem,
	newItemsCount: number
): MailProperties => {
	const isTitanProvider = provider === EmailProvider.Titan;
	const isExtraItemPurchase = isTitanProvider
		? hasTitanMailWithUs( domain )
		: hasGSuiteWithUs( domain );

	const existingItemsCount = isTitanProvider
		? getMaxTitanMailboxCount( domain )
		: getGSuiteMailboxCount( domain );

	const quantity = isExtraItemPurchase ? existingItemsCount + newItemsCount : newItemsCount;
	const newQuantity = isExtraItemPurchase ? newItemsCount : undefined;

	return {
		isExtraItemPurchase,
		mailProduct,
		newQuantity,
		quantity,
	};
};

export { getMailProductProperties };
export type { MailProperties };
