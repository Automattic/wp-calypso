import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function redirectToHostingDashboardBackportIfEnabled(
	context: PageJSContext,
	next: () => void
) {
	if ( isEnabled( 'dashboard/v2/backport/site-settings' ) ) {
		return page.redirect( `/sites/settings/v2/${ context.params.site }` );
	}

	next();
}
