import type { Site } from '../data/types';

export const canUpdatePHPVersion = ( site: Site ): boolean => site.is_wpcom_atomic;

export const canUpdateDefensiveMode = ( site: Site ): boolean => site.is_wpcom_atomic;

export const canAccessPhpMyAdmin = ( site: Site ): boolean => site.is_wpcom_atomic;

export const canUpdateWordPressVersion = ( site: Site ): boolean => site.is_wpcom_staging_site;

export const canSetStaticFile404Handling = ( site: Site ): boolean => site.is_wpcom_atomic;

export const canGetPrimaryDataCenter = ( site: Site ): boolean => site.is_wpcom_atomic;
