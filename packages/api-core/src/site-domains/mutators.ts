import { wpcom } from '../wpcom-fetcher';

export async function setPrimaryDomain( siteId: number, domain: string ): Promise< void > {
	const data = await wpcom.req.post( `/sites/${ siteId }/domains/primary`, { domain } );
	if ( data?.error ) {
		throw new Error( data.message );
	}
}
