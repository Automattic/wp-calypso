import { FEATURE_UPLOAD_THEMES_PLUGINS, planHasFeature } from '@automattic/calypso-products';
import type { Importer } from './types';
import type { SiteDetails } from '@automattic/data-stores';

export const getImporterTypeForEngine = ( engine: Importer ) => `importer-type-${ engine }`;

export function isTargetSitePlanCompatible( targetSite: SiteDetails | undefined ) {
	const planSlug = targetSite?.plan?.product_slug;
	return planSlug && planHasFeature( planSlug, FEATURE_UPLOAD_THEMES_PLUGINS );
}
