import { isEnabled } from '@automattic/calypso-config';
import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import MainSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/main';
import AgencyTierOverview from './primary/agency-tier-overview';
import AgencyTierOverviewV2 from './primary/agency-tier-overview-v2';

export const agencyTierContext: Callback = ( context, next ) => {
	const isTiersRevampEnabled = isEnabled( 'tiers-revamp' );
	context.primary = (
		<>
			<PageViewTracker title="Agency Tier" path={ context.path } />
			{ isTiersRevampEnabled ? <AgencyTierOverviewV2 /> : <AgencyTierOverview /> }
		</>
	);
	context.secondary = <MainSidebar path={ context.path } />;
	next();
};
