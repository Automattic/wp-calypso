import { format as formatUrl, getUrlParts, getUrlFromParts } from '@automattic/calypso-url';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import getSiteAdminPage from './get-site-admin-page';
import getSiteAdminUrl from './get-site-admin-url';

export default function getJetpackAdminUrl( state, siteId ) {
	const siteAdminUrl = getSiteAdminUrl( state, siteId );
	if ( siteAdminUrl === null ) {
		return undefined;
	}
	if ( isSiteAtomic( state, siteId ) ) {
		return siteAdminUrl;
	}

	const parts = getUrlParts( siteAdminUrl + 'admin.php' );
	parts.searchParams.set( 'page', getSiteAdminPage( state, siteId ) );

	return formatUrl( getUrlFromParts( parts ) );
}
