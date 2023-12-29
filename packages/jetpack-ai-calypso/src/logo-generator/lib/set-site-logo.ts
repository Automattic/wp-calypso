/**
 * External dependencies
 */
import wpcomProxyRequest from 'wpcom-proxy-request';
/**
 * Types
 */
import { SetSiteLogoProps, SetSiteLogoResponseProps } from '../../types';

export async function setSiteLogo( { siteId, imageId }: SetSiteLogoProps ) {
	const body = {
		site_logo: imageId,
		site_icon: imageId,
	};

	return wpcomProxyRequest< SetSiteLogoResponseProps >( {
		path: `/sites/${ String( siteId ) }/settings`,
		apiVersion: 'v2',
		apiNamespace: 'wp/v2',
		body,
		query: 'source=jetpack-ai',
		method: 'POST',
	} );
}
