/**
 * Internal dependencies
 */
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getUrlParts, getUrlFromParts } from 'calypso/lib/url';

export default function getJetpackRecommendationsUrl( state ) {
	const site = getSelectedSite( state );

	const adminUrl = site?.options?.admin_url;
	return adminUrl
		? getUrlFromParts( {
				...getUrlParts( adminUrl + 'admin.php' ),
				search: '?page=jetpack',
				hash: '/recommendations',
		  } ).href
		: undefined;
}
