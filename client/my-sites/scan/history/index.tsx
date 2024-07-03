import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import ThreatHistoryList from 'calypso/components/jetpack/threat-history-list';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import ScanNavigation from '../navigation';
import type { FilterValue } from 'calypso/components/jetpack/threat-history-list/threat-status-filter';

import './style.scss';

interface Props {
	filter: FilterValue;
	showNavigation?: boolean;
}

export default function ScanHistoryPage( { filter, showNavigation = true }: Props ) {
	const translate = useTranslate();
	const isJetpackPlatform = isJetpackCloud();

	return (
		<Main
			className={ clsx( 'scan history', {
				is_jetpackcom: isJetpackPlatform,
			} ) }
		>
			<DocumentHead title={ translate( 'Scan' ) } />
			{ isJetpackPlatform && <SidebarNavigation /> }
			<PageViewTracker path="/scan/history/:site" title="Scan History" />
			{ ! ( isJetpackPlatform || isA8CForAgencies() ) && (
				<NavigationHeader navigationItems={ [] } title={ translate( 'Jetpack Scan' ) } />
			) }

			{ showNavigation && <ScanNavigation section="history" /> }
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
