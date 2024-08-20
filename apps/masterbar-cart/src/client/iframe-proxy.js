import wpcom from 'wpcom';
import proxyRequest from 'wpcom-proxy-request';

const createIframeProxyClient = async () => {
	const client = wpcom( proxyRequest );

	// TODO: Catch and handle error(s) in the response
	await client.request( { metaAPI: { accessAllUsersBlogs: true } } );

	return client;
};

export default createIframeProxyClient;
