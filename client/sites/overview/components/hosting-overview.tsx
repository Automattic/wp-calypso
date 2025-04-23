import { useTranslate } from 'i18n-calypso';
import { FC, useCallback, useEffect } from 'react';
import NavigationHeader from 'calypso/components/navigation-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isNotAtomicJetpack, isMigrationInProgress } from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getCurrentRoutePattern from 'calypso/state/selectors/get-current-route-pattern';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ActiveDomainsCard from './active-domains-card';
import MigrationOverview from './migration-overview';
import PlanCard from './plan-card';
import PlanCreditNotice from './plan-credit-notice';
import QuickActionsCard from './quick-actions-card';
import SiteBackupCard from './site-backup-card';
import SupportCard from './support-card';

import './style.scss';

const HostingOverview: FC = () => {
	const site = useSelector( getSelectedSite );
	const currentRoute = useSelector( getCurrentRoute );
	const currentRoutePattern = useSelector( getCurrentRoutePattern );
	const translate = useTranslate();

	const handleBrowsersBack = useCallback(
		( ev: PopStateEvent ) => {
			recordTracksEvent( 'calypso_hosting_overview_back_button', {
				from_route: currentRoute,
				from_route_path: currentRoutePattern,
				to_route: ev.state?.path,
			} );
		},
		[ currentRoute, currentRoutePattern ]
	);

	useEffect( () => {
		window.addEventListener( 'popstate', handleBrowsersBack );
		return () => {
			setTimeout( () => {
				window.removeEventListener( 'popstate', handleBrowsersBack );
			}, 0 );
		};
	}, [ handleBrowsersBack ] );

	if ( site ) {
		if ( isMigrationInProgress( site ) ) {
			return <MigrationOverview site={ site } />;
		}
	}

	const isJetpackNotAtomic = site && isNotAtomicJetpack( site );
	const subtitle = isJetpackNotAtomic
		? translate( 'Get a quick glance at your plans and upgrades.' )
		: translate( 'Get a quick glance at your plans, storage, and domains.' );

	return (
		<div className="hosting-overview">
			<NavigationHeader
				className="hosting-overview__navigation-header"
				title={ translate( 'Overview' ) }
				subtitle={ subtitle }
			/>
			<PlanCreditNotice />
			<PlanCard />
			<QuickActionsCard />
			<ActiveDomainsCard />
			<SiteBackupCard />
			<SupportCard />
		</div>
	);
};

export default HostingOverview;
