import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SiteTools from '../site-tools';

const SiteSettingsGeneral = ( { isWpcomStagingSite } ) => (
	<div className="site-settings__main general-settings">
		{ ! isWpcomStagingSite && <SiteTools headerTitle={ translate( 'Other tools' ) } /> }
	</div>
);

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		isWpcomStagingSite: isSiteWpcomStaging( state, siteId ),
	};
} )( SiteSettingsGeneral );
