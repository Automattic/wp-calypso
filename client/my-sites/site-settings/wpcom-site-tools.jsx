import { localize } from 'i18n-calypso';
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
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import JetpackDevModeNotice from './jetpack-dev-mode-notice';
import WpcomSiteToolsSettings from './wpcom-site-tools-settings';

import './style.scss';

const WpcomSiteTools = ( { isJetpack, isPossibleJetpackConnectionProblem, siteId, translate } ) => {
	return (
		<Main className="site-settings">
			{ isJetpack && isPossibleJetpackConnectionProblem && (
				<JetpackConnectionHealthBanner siteId={ siteId } />
			) }
			<DocumentHead title={ translate( 'Site Tools' ) } />
			<QueryProductsList />
			<QuerySitePurchases siteId={ siteId } />
			<JetpackDevModeNotice />
			<JetpackBackupCredsBanner event="settings-backup-credentials" />
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'Site Tools' ) }
				subtitle={ translate( 'Manage your site settings, including site visibility, and more.' ) }
			/>
			<WpcomSiteToolsSettings />
		</Main>
	);
};

WpcomSiteTools.propTypes = {
	// Connected props
	siteId: PropTypes.number,
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		isJetpack: isJetpackSite( state, siteId ),
	};
} )( localize( withJetpackConnectionProblem( WpcomSiteTools ) ) );
