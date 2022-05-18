import { FEATURE_UPLOAD_THEMES_PLUGINS, planHasFeature } from '@automattic/calypso-products';
import { get } from 'lodash';
import { SitesItem } from 'calypso/state/selectors/get-sites-items';
import { Importer } from './types';

export const getImporterTypeForEngine = ( engine: Importer ) => `importer-type-${ engine }`;

export function isTargetSitePlanCompatible( targetSite: SitesItem ) {
	const planSlug = get( targetSite, 'plan.product_slug' );

	return planSlug && planHasFeature( planSlug, FEATURE_UPLOAD_THEMES_PLUGINS );
}
