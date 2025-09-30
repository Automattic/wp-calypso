import { Context } from '@automattic/calypso-router';
import { AppState } from 'calypso/types';
import getSiteOption from './get-site-option';

const CALYPSO_PARAMS_TO_WP_ADMIN_SEARCH_PARAMS = new Map( [ [ 'mediaId', 'item' ] ] );

/**
 * Returns the url to the wp-admin area for a site, or null if the admin URL
 * for the site cannot be determined.
 * @see https://developer.wordpress.org/reference/functions/get_admin_url/
 * @param  {Object}  state  Global state tree
 * @param  {?number}  siteId Site ID
 * @param  {?string} path   Admin screen path
 * @returns {?string}        Admin URL
 */
export default function getSiteAdminUrl(
	state: AppState,
	siteId: number | null | undefined,
	path = '',
	params: Context[ 'params' ] = {}
): string | null {
	const adminUrl = getSiteOption( state, siteId, 'admin_url' );
	if ( ! adminUrl ) {
		return null;
	}

	const searchParams = new URLSearchParams();

	Object.entries( params ).forEach( ( [ key, value ] ) => {
		const wpAdminSearchParam = CALYPSO_PARAMS_TO_WP_ADMIN_SEARCH_PARAMS.get( key );

		if ( wpAdminSearchParam ) {
			searchParams.set( wpAdminSearchParam, value );
		}
	} );

	const searchParamsValue = searchParams.toString();

	return `${ adminUrl }${ path.replace( /^\//, '' ) }${
		searchParamsValue ? `?${ searchParamsValue }` : ''
	}`;
}
