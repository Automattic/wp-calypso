import { useMemo } from 'react';
import usePressableOwnershipType from 'calypso/a8c-for-agencies/sections/marketplace/hosting-overview/hooks/use-pressable-ownership-type';
import { A4A_MIGRATED_SITE_TAG, A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE } from '../lib/constants';

export default function useCanTagSitesForCommission(): {
	canTagSitesForCommission: boolean;
	migrationTags: string[];
} {
	const pressableOwnership = usePressableOwnershipType();
	const canTagPressableSitesForCommission = pressableOwnership !== 'agency';

	return useMemo( () => {
		const migrationTags = [
			A4A_MIGRATED_SITE_TAG,
			...( canTagPressableSitesForCommission ? [ A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE ] : [] ),
		];
		return {
			canTagSitesForCommission: canTagPressableSitesForCommission,
			migrationTags,
		};
	}, [ canTagPressableSitesForCommission ] );
}
