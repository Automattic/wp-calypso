import { isPressableAddonProduct } from 'calypso/a8c-for-agencies/sections/marketplace/lib/hosting';
import getPressablePlan, {
	PressablePlan,
} from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/lib/get-pressable-plan';
import type { License } from 'calypso/state/partner-portal/types';

export type PressableCapacity = Pick< PressablePlan, 'install' | 'storage' | 'visits' >;

function getNormalizedLicenseQuantity( quantity: number | null ): number {
	return quantity && quantity > 0 ? quantity : 1;
}

function normalizePressableAddonKey( licenseKey: string ): string {
	return licenseKey.split( '_' )[ 0 ];
}

export function calculateAddonCapacityFromLicenses( licenses: License[] = [] ): PressableCapacity {
	return licenses.reduce(
		( total, license ) => {
			if (
				license.referral ||
				license.revokedAt ||
				! isPressableAddonProduct( license.licenseKey )
			) {
				return total;
			}

			const addOnKey = normalizePressableAddonKey( license.licenseKey );
			const addOnInfo = getPressablePlan( addOnKey );

			if ( ! addOnInfo ) {
				return total;
			}

			const quantity = getNormalizedLicenseQuantity( license.quantity );

			return {
				install: total.install + addOnInfo.install * quantity,
				storage: total.storage + addOnInfo.storage * quantity,
				visits: total.visits + addOnInfo.visits * quantity,
			};
		},
		{ install: 0, storage: 0, visits: 0 }
	);
}

export function calculateEffectiveCapacity(
	basePlan: PressableCapacity,
	licenses: License[] = []
): PressableCapacity {
	const addOnCapacity = calculateAddonCapacityFromLicenses( licenses );

	return {
		install: basePlan.install + addOnCapacity.install,
		storage: basePlan.storage + addOnCapacity.storage,
		visits: basePlan.visits + addOnCapacity.visits,
	};
}
