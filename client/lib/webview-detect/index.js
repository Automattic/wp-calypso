/** @format **/

/**
 * This test is for app webviews.
 *
 * @returns {Boolean} whether this is a webview
 */
export function isWebView() {
	/* global navigator:true */
	return navigator && /wp-(android|iphone|mobile)/.test( navigator.userAgent );
}
