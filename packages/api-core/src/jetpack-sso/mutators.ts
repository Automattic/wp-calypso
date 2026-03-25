import { wpcom } from '../wpcom-fetcher';
import type { SsoAuthorizeResponse } from './types';

export async function ssoAuthorize(
	siteId: number | string,
	ssoNonce: string
): Promise< SsoAuthorizeResponse > {
	return wpcom.req.post( `/jetpack-blogs/${ siteId }/sso-authorize`, {
		sso_nonce: ssoNonce,
	} );
}
