import { DotcomFeatures, JetpackModules } from '../data/constants';
import type { Site } from '../data/types';

export function hasPlanFeature( site: Site, feature: `${ DotcomFeatures }` ) {
	if ( ! site.plan ) {
		return false;
	}

	return site.plan.features.active.includes( feature );
}

export function hasAtomicFeature( site: Site, feature: `${ DotcomFeatures }` ) {
	return site.is_wpcom_atomic && ! site.plan?.expired && hasPlanFeature( site, feature );
}

export function hasJetpackModule( site: Site, module: `${ JetpackModules }` ) {
	return site.jetpack && site.jetpack_modules?.includes( module );
}
