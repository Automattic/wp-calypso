import { wpcom } from '../wpcom-fetcher';

export function provisionSslCertificate( domainName: string ): Promise< void > {
	return wpcom.req.post( {
		path: `/domains/ssl/${ domainName }`,
		apiNamespace: 'wpcom/v2',
	} );
}
