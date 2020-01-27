/**
 * External dependencies
 */
declare module 'wpcom-proxy-request' {
	import { WpcomRequestParams } from 'src/utils/wpcom-wrapper';
	export function reloadProxy(): void;
	export default function wpcomProxyRequest(
		params: WpcomRequestParams,
		callback: Function
	): XMLHttpRequest;
}
