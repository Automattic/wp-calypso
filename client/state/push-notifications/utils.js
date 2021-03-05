/**
 * Internal dependencies
 */

import { isServiceWorkerSupported } from 'calypso/lib/service-worker';

export function isUnsupportedChromeVersion() {
	if ( window && window.chrome && window.navigator.appVersion ) {
		return getChromeVersion() < 50;
	}
	return false;
}

export function getChromeVersion() {
	const match = window.navigator.appVersion.match( /Chrome\/(\d+)/ );
	return match ? match[ 1 ] : -1;
}

export function isPushNotificationsSupported() {
	return (
		isServiceWorkerSupported() &&
		'showNotification' in window.ServiceWorkerRegistration.prototype &&
		'PushManager' in window
	);
}

export function isPushNotificationsDenied() {
	return ! ( 'Notification' in window ) || 'denied' === window.Notification.permission;
}

export function isOpera() {
	return getOperaVersion() !== -1;
}

export function getOperaVersion() {
	if ( window && window.navigator && window.navigator.appVersion ) {
		const match = window.navigator.appVersion.match( /OPR\/(\d+)/ );
		return match ? match[ 1 ] : -1;
	}
	return -1;
}

// From https://github.com/GoogleChromeLabs/web-push-codelab/issues/46
export function urlBase64ToUint8Array( base64String ) {
	const padding = '='.repeat( ( 4 - ( base64String.length % 4 ) ) % 4 );
	const base64 = ( base64String + padding ).replace( /\-/g, '+' ).replace( /_/g, '/' );
	const rawData = atob( base64 );
	const outputArray = new Uint8Array( rawData.length );

	for ( let i = 0; i < rawData.length; ++i ) {
		outputArray[ i ] = rawData.charCodeAt( i );
	}
	return outputArray;
}
