import {
	isDomainMapping,
	isDomainRegistration,
	isDomainTransfer,
	isWpComPlan,
} from '@automattic/calypso-products';
import type { Purchase } from 'calypso/lib/purchases/types';
import type {
	UpgradeCreditsNoticeData,
	UpgradeCreditsNoticeSource,
} from 'calypso/my-sites/plans-features-main/hooks/use-upgrade-credits-notice';

function hasOtherUpgradesPurchase( sitePurchases: Purchase[] | undefined ): boolean {
	return (
		sitePurchases?.some( ( purchase ) => {
			const productSlug = purchase?.productSlug;
			if ( ! productSlug ) {
				return false;
			}

			// "Other upgrades" means non-domain and non-plan purchases (e.g. themes add-on, storage, etc).
			if ( isWpComPlan( productSlug ) ) {
				return false;
			}
			if (
				isDomainRegistration( purchase ) ||
				isDomainTransfer( purchase ) ||
				isDomainMapping( purchase )
			) {
				return false;
			}

			return true;
		} ) ?? false
	);
}

/**
 * The upgrade credits hook can't always infer "domain + other upgrades" (some add-on related
 * credits only appear as a generic non-coupon discount). When we can see purchases, refine
 * the source so copy matches what contributed to the credit.
 */
export function getUpgradeCreditsEffectiveSource(
	upgradeCreditsNoticeData: UpgradeCreditsNoticeData | null,
	sitePurchases: Purchase[] | undefined
): UpgradeCreditsNoticeSource | undefined {
	const source = upgradeCreditsNoticeData?.source;
	if ( source === 'domain' && hasOtherUpgradesPurchase( sitePurchases ) ) {
		return 'domain-and-other-upgrades';
	}
	return source;
}
