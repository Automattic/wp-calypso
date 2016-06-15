/**
 * Internal dependencies
 */
import {
	isServiceWorkerSupported,
} from 'lib/service-worker';

export function isPushNotificationsSupported() {
	return (
		isServiceWorkerSupported() &&
		'showNotification' in window.ServiceWorkerRegistration.prototype &&
		'PushManager' in window
	);
}

export function isPushNotificationsDenied() {
	return (
		( ! ( 'Notification' in window ) ) ||
		'denied' === window.Notification.permission
	);
}
