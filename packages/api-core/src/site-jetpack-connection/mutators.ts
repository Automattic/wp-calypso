import { wpcom } from '../wpcom-fetcher';

export async function disconnectJetpackSite( siteId: number ): Promise< void > {
	await wpcom.req.post( `/jetpack-blogs/${ siteId }/mine/delete` );
}
