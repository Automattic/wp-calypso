/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isDomainTransfer } from 'calypso/lib/products-values/is-domain-transfer';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isDomainTransferProduct( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isDomainTransfer( product );
}
