import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import MainSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/main';
import AgencyTierOverview from './primary/agency-tier-overview';

export const agencyTierContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Agency Tier" path={ context.path } />
			<AgencyTierOverview />
		</>
	);
	context.secondary = <MainSidebar path={ context.path } />;
	next();
};
