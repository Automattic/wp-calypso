import { wpcom } from '../wpcom-fetcher';

export async function pointDomainToWpcom( domain: string ): Promise< void > {
	return wpcom.req.post( {
		path: '/domains/point-to-wpcom',
		apiNamespace: 'wpcom/v2',
		body: { domain },
	} );
}
