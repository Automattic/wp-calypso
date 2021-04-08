/**
 * Internal dependencies
 */
import type { FormattedProduct } from './types';

export function isBundled( product: FormattedProduct ): boolean {
	return !! product.is_bundled;
}
