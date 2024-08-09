import createIframeProxyClient from './iframe-proxy';
import createOauthClient from './oauth';

export function createClient() {
	const isProduction = true; // 'production' === process.env.NODE_ENV;
	const clientFactory = isProduction ? createIframeProxyClient : createOauthClient;
	return clientFactory();
}
