import { JETPACK_PLAN_UPGRADE_MAP, JETPACK_PRODUCT_UPGRADE_MAP } from './constants';
import { getJetpackItemTermVariants } from './get-jetpack-item-term-variants';
import { isJetpackPlanSlug } from './is-jetpack-plan-slug';
import { isJetpackProductSlug } from './is-jetpack-product-slug';
import { planHasSuperiorFeature } from './main';
import type { JetpackPurchasableItemSlug } from './types';

/**
 * Check if a Jetpack item (product or plan) is superseding another one. Based on yearly variants.
 * @param supersedingItem Item potentially superseding the other one
 * @param supersededItem Item potentially superseded by the other one
 * @returns True if the first item is superseding the second one
 */
export default function isSupersedingJetpackItem(
	supersedingItem: JetpackPurchasableItemSlug,
	supersededItem: JetpackPurchasableItemSlug
): boolean | undefined {
	const yearlySuperseding = getJetpackItemTermVariants( supersedingItem )?.yearly;
	const yearlySuperseded = getJetpackItemTermVariants( supersededItem )?.yearly;

	if ( ! yearlySuperseding || ! yearlySuperseded ) {
		return undefined;
	}

	if ( isJetpackPlanSlug( yearlySuperseding ) ) {
		return (
			JETPACK_PLAN_UPGRADE_MAP[ yearlySuperseding ]?.includes( yearlySuperseded ) ||
			planHasSuperiorFeature( supersedingItem, supersededItem )
		);
	}

	if ( isJetpackProductSlug( yearlySuperseding ) ) {
		return JETPACK_PRODUCT_UPGRADE_MAP[ yearlySuperseding ]?.includes( yearlySuperseded );
	}
}
