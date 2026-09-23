import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isAllowedA4ADashboardHostname } from 'calypso/dashboard/app-a4a/routing';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

export function recordUnifiedAdminPageView( {
	path,
	route,
	source = 'calypso',
	app: appOverride,
}: {
	path: string;
	route?: string;
	source?: string;
	app?: string;
} ) {
	let app = 'calypso';
	if ( isJetpackCloud() ) {
		app = 'jetpack-cloud';
	} else if ( isA8CForAgencies() || isAllowedA4ADashboardHostname( window.location.hostname ) ) {
		app = 'a4a';
	}
	recordTracksEvent( 'wpcom_unified_admin_page_view', {
		source,
		path,
		...( route ? { route } : {} ),
		app: appOverride ?? app,
	} );
}
