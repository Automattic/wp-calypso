import wpcom from 'wpcom';
import proxyRequest from 'wpcom-proxy-request';

export async function createClient() {
	const client = wpcom( proxyRequest );
	await client.request( { metaAPI: { accessAllUsersBlogs: true } } );
	return client;
}
