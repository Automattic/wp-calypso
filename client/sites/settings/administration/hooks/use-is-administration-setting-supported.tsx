import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';

export default function useIsAdministrationSettingSupported() {
	return ! useSelectedSiteSelector( isSiteWpcomStaging );
}
