/**
 * Internal dependencies
 */
import { JETPACK_LEGACY_PLANS, JETPACK_PRODUCTS_LIST, JETPACK_RESET_PLANS } from './constants';

export default function isJetpackPurchasableItem(
	itemSlug: string,
	options: { includeLegacy?: boolean } = {}
): boolean {
	return [
		...JETPACK_PRODUCTS_LIST,
		...JETPACK_RESET_PLANS,
		...( options.includeLegacy ? JETPACK_LEGACY_PLANS : [] ),
	].includes( itemSlug );
}
