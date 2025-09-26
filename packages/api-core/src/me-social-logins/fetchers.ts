import { wpcom } from '../wpcom-fetcher';

export async function fetchGenerateAuthorizationNonce(): Promise< string > {
	const response = await wpcom.req.get( {
		path: '/generate-authorization-nonce',
		apiNamespace: 'wpcom/v2',
	} );
	return response.nonce;
}
