/**
 * Internal dependencies
 */
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';
import { isDomainTransfer } from 'lib/products-values/is-domain-transfer';

export function isDomainTransferProduct( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isDomainTransfer( product );
}
