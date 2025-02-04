/**
 * Internal dependencies
 */
import wpcomLimitedRequest from './wpcom-limited-request';
/**
 * Types
 */
import type { SetSiteLogoProps, SetSiteLogoResponseProps } from '../../types';

export async function setSiteLogo( { siteId, imageId }: SetSiteLogoProps ) {
	const body = {
		site_logo: imageId,
		site_icon: imageId,
	};

	return wpcomLimitedRequest< SetSiteLogoResponseProps >( {
		path: `/sites/${ String( siteId ) }/settings`,
		apiVersion: 'v2',
		apiNamespace: 'wp/v2',
		body,
		query: 'source=jetpack-ai',
		method: 'POST',
	} );
}
