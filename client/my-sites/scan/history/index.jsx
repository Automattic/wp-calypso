/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import QueryJetpackScanHistory from 'components/data/query-jetpack-scan-history';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { getSelectedSiteId } from 'state/ui/selectors';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ThreatHistoryList from 'components/jetpack/threat-history-list';

/**
 * Style dependencies
 */
import './style.scss';

const ScanHistoryPage = ( { filter, siteId, translate } ) => {
	return (
		<Main className="history">
			<DocumentHead title={ translate( 'History' ) } />
			<SidebarNavigation />
			<QueryJetpackScanHistory siteId={ siteId } />
			<PageViewTracker path="/scan/history/:site" title="Scan History" />
			<h1 className="history__header">{ translate( 'History' ) }</h1>
			<p className="history__description">
				{ translate(
					'The scanning history contains a record of all previously active threats on your site.'
				) }
			</p>
			<ThreatHistoryList { ...{ filter } } />
		</Main>
	);
};

export default connect( ( state ) => ( {
	siteId: getSelectedSiteId( state ),
} ) )( localize( ScanHistoryPage ) );
