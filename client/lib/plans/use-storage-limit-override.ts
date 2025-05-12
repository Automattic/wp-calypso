import {
	PLAN_WPCOM_PRO,
	PLAN_WPCOM_STARTER,
	PLAN_FREE,
	PLAN_WPCOM_FLEXIBLE,
} from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import isLegacySiteWithHigherLimits from 'calypso/state/selectors/is-legacy-site-with-higher-limits';
import { getSitePlanSlug } from 'calypso/state/sites/selectors';

export function useStorageLimitOverride( {
	currentStorageBytes,
	siteId,
}: {
	currentStorageBytes?: number;
	siteId: number | null;
} ): number | undefined {
	const legacySiteWithHigherLimits = useSelector( ( state ) =>
		isLegacySiteWithHigherLimits( state, siteId )
	);
	const sitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) );

	if ( ! currentStorageBytes ) {
		return currentStorageBytes;
	}

	if ( ! sitePlanSlug ) {
		return currentStorageBytes;
	}

	// Only override the storage for non-legacy sites that are on a free
	// plan. Even if the site is on a free plan, it could have a space
	// upgrade product on top of that, so also check that it is using the
	// default free space before overriding it (that is somewhat fragile,
	// but this code is expected to be temporary anyway).
	if (
		( sitePlanSlug === PLAN_FREE || sitePlanSlug === PLAN_WPCOM_FLEXIBLE ) &&
		! legacySiteWithHigherLimits &&
		currentStorageBytes === 3072 * 1024 * 1024
	) {
		// 1GB
		return 1024 * 1024 * 1024;
	}

	if ( sitePlanSlug === PLAN_WPCOM_PRO ) {
		// 50GB
		return 50 * 1024 * 1024 * 1024;
	}

	if ( sitePlanSlug === PLAN_WPCOM_STARTER ) {
		// 6GB
		return 6 * 1024 * 1024 * 1024;
	}

	return currentStorageBytes;
}
