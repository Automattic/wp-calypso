import { wpcom } from '../wpcom-fetcher';
import type { SslDetails } from './types';

export async function fetchSslDetails( domainName: string ): Promise< SslDetails > {
	const response = await wpcom.req.get( {
		path: `/domains/ssl/${ domainName }`,
		apiNamespace: 'wpcom/v2',
	} );
	return response.data;
}
