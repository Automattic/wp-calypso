import { FEATURE_SFTP } from '@automattic/calypso-products';
import { SiteExcerptData } from '@automattic/sites';
import { useSelector } from 'calypso/state';
import getSiteFeatures from 'calypso/state/selectors/get-site-features';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';

export function areHostingFeaturesSupported( site?: SiteExcerptData | null ) {
	const isAtomicSite = !! site?.is_wpcom_atomic || !! site?.is_wpcom_staging_site;
	const isPlanExpired = site?.plan?.expired;

	return isAtomicSite && ! isPlanExpired;
}

export function useAreHostingFeaturesSupported() {
	const site = useSelector( getSelectedSite );
	return areHostingFeaturesSupported( site );
}

export function areAdvancedHostingFeaturesSupported( state: AppState ) {
	const site = getSelectedSite( state );
	const features = getSiteFeatures( state, site?.ID );
	const hasSftpFeature = siteHasFeature( state, site?.ID, FEATURE_SFTP );

	if ( ! features ) {
		return null;
	}
	return areHostingFeaturesSupported( site ) && hasSftpFeature;
}

export function useAreAdvancedHostingFeaturesSupported() {
	return useSelector( areAdvancedHostingFeaturesSupported );
}
