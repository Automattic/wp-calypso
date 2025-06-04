import { DotcomFeatures } from '../data/constants';
import type { Site } from '../data/types';

export const hasPlanFeature = ( site: Site, feature: DotcomFeatures ) => {
	if ( ! site.plan ) {
		return false;
	}

	return site.plan.features.active.includes( feature );
};

export const canUpdatePHPVersion = ( site: Site ): boolean => site.is_wpcom_atomic;

export const canUpdateDefensiveMode = ( site: Site ): boolean => site.is_wpcom_atomic;

export const canAccessPhpMyAdmin = ( site: Site ): boolean => site.is_wpcom_atomic;

export const canUpdateWordPressVersion = ( site: Site ): boolean => site.is_wpcom_staging_site;

export const canSetStaticFile404Handling = ( site: Site ): boolean => site.is_wpcom_atomic;

export const canGetPrimaryDataCenter = ( site: Site ): boolean => site.is_wpcom_atomic;

export const canUpdateHundredYearPlanFeatures = ( site: Site ): boolean => {
	return (
		hasPlanFeature( site, DotcomFeatures.LEGACY_CONTACT ) ||
		hasPlanFeature( site, DotcomFeatures.LOCKED_MODE )
	);
};

export const canUpdateCaching = ( site: Site ) => site.is_wpcom_atomic;

export const isEdgeCacheAvailable = ( site: Site ) => ! site.is_private && ! site.is_coming_soon;

export const canUseSftp = ( site: Site ) => {
	return (
		!! site.is_wpcom_atomic && ! site.plan?.expired && hasPlanFeature( site, DotcomFeatures.SFTP )
	);
};

export const canUseSsh = ( site: Site ) => {
	return canUseSftp( site ) && hasPlanFeature( site, DotcomFeatures.SSH );
};
