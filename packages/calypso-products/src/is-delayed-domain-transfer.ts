import { isDomainTransfer } from './is-domain-transfer';

export function isDelayedDomainTransfer( product: {
	productSlug: string;
	delayedProvisioning: boolean;
} ): boolean {
	return isDomainTransfer( product ) && product.delayedProvisioning;
}
