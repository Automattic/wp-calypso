/**
 * External dependencies
 */
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import QueryJetpackScanHistory from 'components/data/query-jetpack-scan-history';
import FormattedHeader from 'components/formatted-header';
import ThreatHistoryList from 'components/jetpack/threat-history-list';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getSelectedSiteId } from 'state/ui/selectors';
import ScanNavigation from '../navigation';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	filter: string;
}

export default function ScanHistoryPage( { filter }: Props ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isJetpackPlatform = isJetpackCloud();

	return (
		<Main
			className={ classNames( 'history', {
				is_jetpackcom: isJetpackPlatform,
			} ) }
			wideLayout={ ! isJetpackPlatform }
		>
			<DocumentHead title={ translate( 'Scan' ) } />
			<SidebarNavigation />
			<QueryJetpackScanHistory siteId={ siteId } />
			<PageViewTracker path="/scan/history/:site" title="Scan History" />
			{ ! isJetpackPlatform && <FormattedHeader headerText={ 'Jetpack Scan' } align="left" /> }
			<ScanNavigation section={ 'history' } />
			<section className="history__body">
				<p className="history__description">
					{ translate(
						'The scanning history contains a record of all previously active threats on your site.'
					) }
				</p>
				<ThreatHistoryList filter={ filter } />
			</section>
		</Main>
	);
}
