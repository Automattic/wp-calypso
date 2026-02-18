import { wpcom } from '../wpcom-fetcher';

export type AkismetApiKey = string;

export async function fetchAkismetApiKey(): Promise< AkismetApiKey > {
	const key: AkismetApiKey = await wpcom.req.get( {
		path: '/akismet/get-key',
		apiNamespace: 'wpcom/v2',
	} );
	return key;
}
