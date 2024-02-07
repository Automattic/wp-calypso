import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import getIsUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SiteTools from '../site-tools';
import LaunchSite from '../site-visibility/launch-site';

const SiteSettingsGeneral = ( {
	isWpcomStagingSite,
	isAtomicAndEditingToolkitDeactivated,
	isUnlaunchedSite,
} ) => (
	<div className="site-settings__main general-settings">
		{ isUnlaunchedSite && ! isAtomicAndEditingToolkitDeactivated && ! isWpcomStagingSite && (
			<LaunchSite />
		) }
		{ ! isWpcomStagingSite && <SiteTools headerTitle={ translate( 'Other tools' ) } /> }
	</div>
);

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		isWpcomStagingSite: isSiteWpcomStaging( state, siteId ),
		isAtomicAndEditingToolkitDeactivated:
			isAtomicSite( state, siteId ) &&
			getSiteOption( state, siteId, 'editing_toolkit_is_active' ) === false,
		isUnlaunchedSite: getIsUnlaunchedSite( state, siteId ),
	};
} )( SiteSettingsGeneral );
