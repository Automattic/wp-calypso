import {
	getMaxTitanMailboxCount,
	hasTitanMailWithUs,
	getGSuiteMailboxCount,
	hasGSuiteWithUs,
} from '../../utils/domain';
import { MailboxProvider } from '../types';
import type { Domain, Product } from '@automattic/api-core';

type EmailProperties = {
	existingItemsCount: number;
	isAdditionalMailboxesPurchase: boolean;
	emailProduct: Product;
	newQuantity: number | undefined;
	quantity: number;
};

const getEmailProductProperties = (
	provider: MailboxProvider,
	domain: Domain,
	emailProduct: Product,
	newMailboxesCount = 1
): EmailProperties => {
	const isTitanProvider = provider === MailboxProvider.Titan;
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
