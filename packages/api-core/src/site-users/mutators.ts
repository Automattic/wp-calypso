import { __ } from '@wordpress/i18n';
import { wpcom } from '../wpcom-fetcher';
import type { SiteUser, SiteUserMeta } from './types';

export async function deleteSiteUser( siteId: number, userId: number ) {
	const result: { success: boolean } = await wpcom.req.post( {
		path: `/sites/${ siteId }/users/${ userId }/delete`,
	} );

	if ( result?.success !== true ) {
		throw new Error( __( 'Could not leave the site. Please try again.' ) );
	}

	return result;
}

export async function updateCurrentSiteUserMeta(
	siteId: number,
	meta: SiteUserMeta
): Promise< SiteUser > {
	return wpcom.req.post( {
		apiNamespace: 'wp/v2',
		path: `/sites/${ siteId }/users/me`,
		body: { meta },
	} );
}
