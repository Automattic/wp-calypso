import { getPressablePlanInfo, isPressableAddonProduct } from './pressable-plans';
import type { PressablePlan } from './pressable-plans';
import type { AgencyProduct, JetpackLicense } from '@automattic/api-core';

export type PressableCapacity = Pick< PressablePlan, 'install' | 'storage' | 'visits' >;

// Add-on license keys carry a unique suffix after an underscore.
const normalizeAddonKey = ( licenseKey: string ) => licenseKey.split( '_' )[ 0 ];

function getAddonCapacity(
	licenses: JetpackLicense[],
	products: AgencyProduct[]
): PressableCapacity {
	return licenses.reduce< PressableCapacity >(
		( total, license ) => {
			if (
				license.referral ||
				license.revoked_at ||
				! isPressableAddonProduct( license.license_key )
			) {
				return total;
			}
			const addonSlug = normalizeAddonKey( license.license_key );
			const addonProduct = products.find( ( product ) => product.slug === addonSlug );
			const addon = addonProduct && getPressablePlanInfo( addonProduct );
			if ( ! addon ) {
				return total;
			}
			const quantity = license.quantity && license.quantity > 0 ? license.quantity : 1;
			return {
				install: total.install + addon.install * quantity,
				storage: total.storage + addon.storage * quantity,
				visits: total.visits + addon.visits * quantity,
			};
		},
		{ install: 0, storage: 0, visits: 0 }
	);
}

/** The plan limits plus whatever the agency's add-ons contribute. */
export function calculateEffectiveCapacity(
	basePlan: PressableCapacity,
	licenses: JetpackLicense[] = [],
	products: AgencyProduct[] = []
): PressableCapacity {
	const addons = getAddonCapacity( licenses, products );
	return {
		install: basePlan.install + addons.install,
		storage: basePlan.storage + addons.storage,
		visits: basePlan.visits + addons.visits,
	};
}
