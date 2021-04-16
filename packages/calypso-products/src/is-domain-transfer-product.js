/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';
import { isDomainTransfer } from './is-domain-transfer';

export function isDomainTransferProduct( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isDomainTransfer( product );
}
