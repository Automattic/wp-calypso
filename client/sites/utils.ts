import { SiteExcerptData } from '@automattic/sites';

export function isAtomicFeatureSupported( site?: SiteExcerptData | null ) {
	const isAtomicSite = !! site?.is_wpcom_atomic || !! site?.is_wpcom_staging_site;
	const isPlanExpired = site?.plan?.expired;

	return isAtomicSite && ! isPlanExpired;
}
