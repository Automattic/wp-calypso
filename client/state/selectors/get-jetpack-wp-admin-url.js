/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import { getUrlParts, getUrlFromParts } from 'lib/url';

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
