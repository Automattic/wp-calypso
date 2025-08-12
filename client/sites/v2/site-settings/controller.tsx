import page from '@automattic/calypso-router';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function redirectToHostingDashboardBackportIfEnabled( context: PageJSContext ) {
	return page.redirect( `/sites/${ context.params.site }/settings` );
}
