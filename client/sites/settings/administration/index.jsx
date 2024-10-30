import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SiteTools from '../../../my-sites/site-settings/site-tools';
import { SOURCE_SETTINGS_ADMINISTRATION } from '../../../my-sites/site-settings/site-tools/utils';

export default function AdministrationSettings() {
	const isWpcomStagingSite = useSelector( ( state ) =>
		isSiteWpcomStaging( state, getSelectedSiteId( state ) )
	);
	return (
		<div className="administration-settings">
			{ ! isWpcomStagingSite && (
				<SiteTools
					headerTitle={ translate( 'Administration' ) }
					source={ SOURCE_SETTINGS_ADMINISTRATION }
				/>
			) }
		</div>
	);
}
