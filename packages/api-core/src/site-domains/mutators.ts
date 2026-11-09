import { wpcom } from '../wpcom-fetcher';

export async function setPrimaryDomain( siteId: number, domain: string ): Promise< void > {
	await wpcom.req.post( `/sites/${ siteId }/domains/primary`, { domain } );
}
