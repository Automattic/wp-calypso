/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import config from 'config';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import QueryJetpackScanHistory from 'components/data/query-jetpack-scan-history';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ThreatHistoryList from 'components/jetpack/threat-history-list';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';

/**
 * Style dependencies
 */
import './style.scss';

const ScanHistoryPage = ( { filter, siteId, siteSlug, translate } ) => {
	return (
		<Main className="history">
			<DocumentHead title={ translate( 'History' ) } />
			<SidebarNavigation />
			<QueryJetpackScanHistory siteId={ siteId } />
			<PageViewTracker path="/scan/history/:site" title="Scan History" />
			<h1 className="history__header">
				{ config.isEnabled( 'jetpack-cloud' )
					? translate( 'History' )
					: translate( 'Jetpack Scan' ) }
			</h1>
			{ ! config.isEnabled( 'jetpack-cloud' ) && (
				<SectionNav>
					<NavTabs>
						<NavItem path={ `/scan/${ siteSlug }` } selected={ false }>
							{ translate( 'Scanner' ) }
						</NavItem>
						<NavItem path={ `/scan/history/${ siteSlug }` } selected={ true }>
							{ translate( 'History' ) }
						</NavItem>
					</NavTabs>
				</SectionNav>
			) }
			<p className="history__description">
				{ translate(
					'The scanning history contains a record of all previously active threats on your site.'
				) }
			</p>
			<ThreatHistoryList { ...{ filter } } />
		</Main>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		siteSlug: getSelectedSiteSlug( state, siteId ),
	};
} )( localize( ScanHistoryPage ) );
