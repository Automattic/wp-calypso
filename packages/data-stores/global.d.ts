/**
 * External dependencies
 */
declare module 'wpcom-proxy-request' {
	type WpcomRequestParams = import('./src/utils/wpcom-wrapper').WpcomRequestParams;
	export function reloadProxy(): void;
	export default function wpcomProxyRequest(
		params: WpcomRequestParams,
		callback: Function
	): XMLHttpRequest;
}
