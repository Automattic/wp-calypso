/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';
import { isDomainTransfer } from './is-domain-transfer';

export function isDomainTransferProduct( product ) {
	product = formatProduct( product );

	return isDomainTransfer( product );
}
