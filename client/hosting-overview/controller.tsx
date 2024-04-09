import ActiveDomains from 'calypso/hosting-overview/components/active-domains';
import QuickActionsCard from 'calypso/hosting-overview/components/quick-actions-card';
import MySitesNavigation from 'calypso/my-sites/navigation';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export default function hostingOverview( context: PageJSContext, next: () => void ) {
	context.secondary = <MySitesNavigation path={ context.path } />;

	context.primary = (
		<>
			<QuickActionsCard />
			<ActiveDomains />
		</>
	);

	next();
}
