import { isAllowedCiabDashboardHostname } from 'calypso/dashboard/app-ciab/routing';
import { recordUnifiedAdminPageView } from 'calypso/lib/analytics/record-admin-page-view';

let lastTrackedPath: string | null = null;

export function recordStepperPageView( { path, route }: { path: string; route: string } ) {
	if ( lastTrackedPath === path || isAllowedCiabDashboardHostname( window.location.hostname ) ) {
		return;
	}
	recordUnifiedAdminPageView( { source: 'stepper', path, route } );
	lastTrackedPath = path;
}
