/**
 * Internal dependencies
 */
import { isDomainTransfer } from 'calypso/lib/products-values/is-domain-transfer';
import type { DelayedDomainTransferProduct } from './types';

export function isDelayedDomainTransfer( product: DelayedDomainTransferProduct ): boolean {
	return Boolean( isDomainTransfer( product ) && product.delayedProvisioning );
}
