import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import ThreatHistoryList from 'calypso/components/jetpack/threat-history-list';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import ScanNavigation from '../navigation';
import type { FilterValue } from 'calypso/components/jetpack/threat-history-list/threat-status-filter';

import './style.scss';

interface Props {
	filter: FilterValue;
}

export default function ScanHistoryPage( { filter }: Props ) {
	const translate = useTranslate();
	const isJetpackPlatform = isJetpackCloud();

	return (
		<Main
			className={ classNames( 'scan history', {
				is_jetpackcom: isJetpackPlatform,
			} ) }
		>
			<DocumentHead title={ translate( 'Scan' ) } />
			<SidebarNavigation />
			<PageViewTracker path="/scan/history/:site" title="Scan History" />
			{ ! isJetpackPlatform && (
				<FormattedHeader headerText={ 'Jetpack Scan' } align="left" brandFont />
			) }

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
