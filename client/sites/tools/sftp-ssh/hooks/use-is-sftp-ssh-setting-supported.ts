import { FEATURE_SFTP } from '@automattic/calypso-products';
import getSiteFeatures from 'calypso/state/selectors/get-site-features';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';

export default function useIsSftpSshSettingSupported() {
	const features = useSelectedSiteSelector( getSiteFeatures );
	const hasSftpFeature = useSelectedSiteSelector( siteHasFeature, FEATURE_SFTP );

	if ( ! features ) {
		return null;
	}
	return hasSftpFeature;
}
