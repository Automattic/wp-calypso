import { getUrlParts, getUrlFromParts } from '@automattic/calypso-url';
import { get } from 'lodash';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export default function getJetpackWpAdminUrl( state ) {
	const site = getSelectedSite( state );

	const adminUrl = get( site, 'options.admin_url' );
	return adminUrl
		? getUrlFromParts( {
				...getUrlParts( adminUrl + 'admin.php' ),
				search: '?page=jetpack',
				hash: '/my-plan',
		  } ).href
		: undefined;
}
