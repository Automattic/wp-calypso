import { Page } from '@wordpress/admin-ui';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackFooter from 'calypso/components/jetpack/jetpack-footer';
import ThreatHistoryList from 'calypso/components/jetpack/threat-history-list';
import JetpackTitle from 'calypso/components/jetpack-title';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import ScanNavigation from '../navigation';
import type { FilterValue } from 'calypso/components/jetpack/threat-history-list/threat-status-filter';

import './style.scss';

interface Props {
	filter: FilterValue;
}

export default function ScanHistoryPage( { filter }: Props ) {
	const translate = useTranslate();
	const isJetpackPlatform = isJetpackCloud() || isA8CForAgencies();
	const showHeader = ! isJetpackPlatform;

	return (
		<Main
			fullWidthLayout
			className={ clsx( 'scan history', {
				is_jetpackcom: isJetpackCloud(),
			} ) }
		>
			<DocumentHead title={ translate( 'Scan' ) } />
			{ isJetpackCloud() && <SidebarNavigation /> }
			<PageViewTracker path="/scan/history/:site" title="Scan History" />
			<Page
				hasPadding
				showSidebarToggle={ false }
				title={ showHeader ? <JetpackTitle title={ translate( 'Scan' ) } /> : undefined }
				subTitle={
					showHeader
						? translate( 'Automated malware scanning and firewall protection.' )
						: undefined
				}
			>
				<ScanNavigation section="history" />
				<section className="history__body">
					<p className="history__description">
						{ translate(
							'The scanning history contains a record of all previously active threats on your site.'
						) }
					</p>
					<ThreatHistoryList filter={ filter } />
				</section>
			</Page>
			{ showHeader && <JetpackFooter /> }
		</Main>
	);
}
