import { WPCOM_FEATURES_ATOMIC } from '@automattic/calypso-products';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import { untrailingslashit } from 'calypso/lib/route';
import type { ImportJob, Importer } from './types';
import type { SiteDetails } from '@automattic/data-stores';

export const getImporterTypeForEngine = ( engine: Importer ) => `importer-type-${ engine }`;

export function isTargetSitePlanCompatible( targetSite: SiteDetails | undefined ) {
	return Boolean( targetSite?.plan?.features?.active?.includes( WPCOM_FEATURES_ATOMIC ) );
}

export function isPlanUpgradeRequiredForImport(
	targetSite: SiteDetails | undefined,
	job: ImportJob | undefined
) {
	return (
		! isTargetSitePlanCompatible( targetSite ) &&
		( job?.importerFileType === 'playground' || job?.importerFileType === 'jetpack_backup' )
	);
}

export function formatSlugToURL( inputUrl: string ) {
	if ( ! inputUrl ) {
		return '';
	}
	// If it's not a valid URL, return it
	if ( ! CAPTURE_URL_RGX.test( inputUrl ) ) {
		return inputUrl;
	}
	let url = inputUrl.trim().toLowerCase();
	if ( url && ! url.startsWith( 'http' ) ) {
		url = 'http://' + url;
	}
	url = url.replace( /wp-admin\/?$/, '' );
	return untrailingslashit( url );
}

export function buildCheckoutUrl( siteSlug: string | undefined | null, plan = 'business' ) {
	if ( ! siteSlug ) {
		return `/checkout/${ plan }`;
	}
	return `/checkout/${ siteSlug }/${ plan }`;
}
