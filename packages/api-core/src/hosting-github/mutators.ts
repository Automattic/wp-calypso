import { wpcom } from '../wpcom-fetcher';

export async function saveGitHubCredentials( accessToken: string ): Promise< void > {
	return await wpcom.req.post(
		{
			path: '/hosting/github/accounts',
			apiNamespace: 'wpcom/v2',
		},
		{
			access_token: accessToken,
		}
	);
}
