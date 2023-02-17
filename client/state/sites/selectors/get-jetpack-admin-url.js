import { format as formatUrl, getUrlParts, getUrlFromParts } from '@automattic/calypso-url';
import getSiteAdminPage from './get-site-admin-page';
import getSiteAdminUrl from './get-site-admin-url';

export default function getJetpackAdminUrl( state, siteId ) {
	const siteAdminUrl = getSiteAdminUrl( state, siteId );
	if ( ! siteAdminUrl ) {
		return undefined;
	}

	const parts = getUrlParts( siteAdminUrl + 'admin.php' );
	parts.searchParams.set( 'page', getSiteAdminPage( state, siteId ) );

	return formatUrl( getUrlFromParts( parts ) );
}
