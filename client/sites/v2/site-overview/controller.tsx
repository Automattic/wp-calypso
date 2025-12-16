import { dashboardLink } from 'calypso/dashboard/utils/link';
import { hasDashboardOptIn } from 'calypso/state/dashboard/selectors/has-dashboard-opt-in';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function redirectToDashboardIfOptedIn( context: PageJSContext, next: () => void ) {
	if ( hasDashboardOptIn( context.store.getState() ) ) {
		window.location.href = dashboardLink( `/sites/${ context.params.site }` );
		return;
	}

	next();
}
