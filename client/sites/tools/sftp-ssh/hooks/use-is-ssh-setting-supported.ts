import { FEATURE_SSH } from '@automattic/calypso-products';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';

export default function useIsSshSettingSupported() {
	return useSelectedSiteSelector( siteHasFeature, FEATURE_SSH );
}
