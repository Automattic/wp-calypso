import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import JetpackBackupCredsBanner from 'calypso/blocks/jetpack-backup-creds-banner';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import JetpackDevModeNotice from './jetpack-dev-mode-notice';
import SiteSettingsNavigation from './navigation';
import GeneralSettings from './section-general';

import './style.scss';

const SiteSettingsComponent = ( { siteId, translate } ) => {
	return (
		<Main className="site-settings">
			<ScreenOptionsTab wpAdminPath="options-general.php" />
			<DocumentHead title={ translate( 'General Settings' ) } />
			<QueryProductsList />
			<QuerySitePurchases siteId={ siteId } />
			<JetpackDevModeNotice />
			<SidebarNavigation />
			<JetpackBackupCredsBanner event={ 'settings-backup-credentials' } />
			<FormattedHeader
				brandFont
				className="site-settings__page-heading"
				headerText={ translate( 'General Settings' ) }
				subHeaderText={ translate(
					'Manage your site settings, including language, time zone, site visibility, and more.'
				) }
				align="left"
				hasScreenOptions
			/>
			<SiteSettingsNavigation section={ 'general' } />
			<GeneralSettings />
		</Main>
	);
};

SiteSettingsComponent.propTypes = {
	// Connected props
	siteId: PropTypes.number,
};

export default connect( ( state ) => ( {
	siteId: getSelectedSiteId( state ),
} ) )( localize( SiteSettingsComponent ) );
