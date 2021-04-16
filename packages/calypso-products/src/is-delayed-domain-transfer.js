/**
 * Internal dependencies
 */
import { isDomainTransfer } from './is-domain-transfer';

export function isDelayedDomainTransfer( product ) {
	return isDomainTransfer( product ) && product.delayedProvisioning;
}
