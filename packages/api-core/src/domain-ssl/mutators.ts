import { wpcom } from '../wpcom-fetcher';

export function provisionSslCertificate( domainName: string ): Promise< void > {
	return wpcom.req.post( {
		// The trailing slash stops nginx from rejecting `.md` domains as file requests.
		path: `/domains/ssl/${ domainName }/`,
		apiNamespace: 'wpcom/v2',
	} );
}
