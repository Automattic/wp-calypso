/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';
import { isDomainTransfer } from './is-domain-transfer';

export function isDomainTransferProduct( product ) {
	product = snakeCase( product );
	return isDomainTransfer( product );
}
