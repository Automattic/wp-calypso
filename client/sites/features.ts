import { FEATURE_SFTP } from '@automattic/calypso-products';
import { SiteExcerptData } from '@automattic/sites';
import { useSelector } from 'calypso/state';
import getSiteFeatures from 'calypso/state/selectors/get-site-features';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export function areHostingFeaturesSupported( site?: SiteExcerptData | null ) {
	const isAtomicSite = !! site?.is_wpcom_atomic || !! site?.is_wpcom_staging_site;
	const isPlanExpired = site?.plan?.expired;

	return isAtomicSite && ! isPlanExpired;
}

export function useAreHostingFeaturesSupported() {
	const site = useSelector( getSelectedSite );
	return areHostingFeaturesSupported( site );
}

export function useAreAdvancedHostingFeaturesSupported() {
	const site = useSelector( getSelectedSite );
	const features = useSelectedSiteSelector( getSiteFeatures );
	const hasSftpFeature = useSelectedSiteSelector( siteHasFeature, FEATURE_SFTP );

	if ( ! features ) {
		return null;
	}
	return areHostingFeaturesSupported( site ) && hasSftpFeature;
}
