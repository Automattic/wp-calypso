/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isDomainTransfer } from 'calypso/lib/products-values/is-domain-transfer';

export function isDomainTransferProduct( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isDomainTransfer( product );
}
