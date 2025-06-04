import { DotcomFeatures } from '../data/constants';
import type { Site } from '../data/types';

export const canUpdatePHPVersion = ( site: Site ): boolean => site.is_wpcom_atomic;

export const canUpdateDefensiveMode = ( site: Site ): boolean => site.is_wpcom_atomic;

export const canAccessPhpMyAdmin = ( site: Site ): boolean => site.is_wpcom_atomic;

export const canUpdateWordPressVersion = ( site: Site ): boolean => site.is_wpcom_staging_site;

export const canSetStaticFile404Handling = ( site: Site ): boolean => site.is_wpcom_atomic;

export const canGetPrimaryDataCenter = ( site: Site ): boolean => site.is_wpcom_atomic;

export const canUpdateHundredYearPlanFeatures = ( site: Site ): boolean => {
	if ( ! site.plan ) {
		return false;
	}

	const { plan } = site;
	return [ DotcomFeatures.LEGACY_CONTACT, DotcomFeatures.LOCKED_MODE ].some( ( feature ) =>
		plan.features.active.includes( feature )
	);
};

export const canUpdateCaching = ( site: Site ) => site.is_wpcom_atomic;

export const isEdgeCacheAvailable = ( site: Site ) => ! site.is_private && ! site.is_coming_soon;
