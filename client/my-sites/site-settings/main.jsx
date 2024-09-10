import { localize, translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import JetpackBackupCredsBanner from 'calypso/blocks/jetpack-backup-creds-banner';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { JetpackConnectionHealthBanner } from 'calypso/components/jetpack/connection-health';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { withJetpackConnectionProblem } from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-problem.js';
import { isAdminInterfaceWPAdmin } from 'calypso/state/sites/selectors';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import JetpackDevModeNotice from './jetpack-dev-mode-notice';
import SiteSettingsNavigation from './navigation';
import GeneralSettings from './section-general';

import './style.scss';

const getTitle = ( adminInterfaceIsWPAdmin ) => {
	if ( adminInterfaceIsWPAdmin ) {
		return translate( 'Settings' );
	}
	return translate( 'General Settings' );
};

const getSubtitle = ( adminInterfaceIsWPAdmin ) => {
	if ( adminInterfaceIsWPAdmin ) {
		return translate( 'Manage your site settings, including site visibility, and more.' );
	}
	return translate(
		'Manage your site settings, including language, time zone, site visibility, and more.'
	);
};

const SiteSettingsComponent = ( {
	isJetpack,
	isPossibleJetpackConnectionProblem,
	siteId,
	adminInterfaceIsWPAdmin,
} ) => {
	return (
		<Main className="site-settings">
			{ isJetpack && isPossibleJetpackConnectionProblem && (
				<JetpackConnectionHealthBanner siteId={ siteId } />
			) }
			<DocumentHead title={ getTitle( adminInterfaceIsWPAdmin ) } />
			<QueryProductsList />
			<QuerySitePurchases siteId={ siteId } />
			<JetpackDevModeNotice />
			<JetpackBackupCredsBanner event="settings-backup-credentials" />
			<NavigationHeader
				screenOptionsTab={ adminInterfaceIsWPAdmin ? false : 'options-general.php' }
				navigationItems={ [] }
				title={ getTitle( adminInterfaceIsWPAdmin ) }
				subtitle={ getSubtitle( adminInterfaceIsWPAdmin ) }
			/>
			<SiteSettingsNavigation section="general" />
			<GeneralSettings />
		</Main>
	);
};

SiteSettingsComponent.propTypes = {
	// Connected props
	siteId: PropTypes.number,
	adminInterfaceIsWPAdmin: PropTypes.bool,
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		isJetpack: isJetpackSite( state, siteId ),
		adminInterfaceIsWPAdmin: isAdminInterfaceWPAdmin( state, siteId ),
	};
} )( localize( withJetpackConnectionProblem( SiteSettingsComponent ) ) );
