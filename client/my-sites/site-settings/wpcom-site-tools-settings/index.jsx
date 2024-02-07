import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SiteTools from '../site-tools';
import { SOURCE_SETTINGS_SITE_TOOLS } from '../site-tools/utils';

const SiteSettingsGeneral = ( { isWpcomStagingSite } ) => (
	<div className="site-settings__main general-settings">
		{ ! isWpcomStagingSite && (
			<SiteTools headerTitle={ translate( 'Other tools' ) } source={ SOURCE_SETTINGS_SITE_TOOLS } />
		) }
	</div>
);

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		isWpcomStagingSite: isSiteWpcomStaging( state, siteId ),
	};
} )( SiteSettingsGeneral );
