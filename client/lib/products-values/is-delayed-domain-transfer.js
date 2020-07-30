/**
 * Internal dependencies
 */
import { isDomainTransfer } from 'lib/products-values/is-domain-transfer';

export function isDelayedDomainTransfer( product ) {
	return isDomainTransfer( product ) && product.delayedProvisioning;
}
