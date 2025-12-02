import config from '@automattic/calypso-config';
import { type PushNotificationStatus } from './type';

const isServiceWorkerSupported = () => {
	return window && 'serviceWorker' in window.navigator && 'ServiceWorkerRegistration' in window;
};

const isPushNotificationsSupported = () => {
	return (
		'showNotification' in window.ServiceWorkerRegistration.prototype && 'PushManager' in window
	);
};

export const isSupported = () => {
	return isServiceWorkerSupported() && isPushNotificationsSupported();
};

// From https://github.com/GoogleChromeLabs/web-push-codelab/issues/46
export function urlBase64ToUint8Array( base64String: string ) {
	const padding = '='.repeat( ( 4 - ( base64String.length % 4 ) ) % 4 );
	const base64 = ( base64String + padding ).replace( /-/g, '+' ).replace( /_/g, '/' );
	const rawData = atob( base64 );
	const outputArray = new Uint8Array( rawData.length );

	for ( let i = 0; i < rawData.length; ++i ) {
		outputArray[ i ] = rawData.charCodeAt( i );
	}
	return outputArray;
}

const activateSubscription = async () => {
	const worker = await navigator.serviceWorker.ready;
	const subscription = await worker.pushManager.subscribe( {
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array( config( 'push_notification_vapid_key' ) ),
	} );
	return subscription;
};

const getPermissionState = async () => {
	const worker = await navigator.serviceWorker.ready;
	const permissionState = await worker.pushManager.permissionState( { userVisibleOnly: true } );
	return permissionState;
};

const getSubscriptionState = async () => {
	const worker = await navigator.serviceWorker.ready;
	const subscription = await worker.pushManager.getSubscription();

	return subscription;
};

export const startBrowserSubscription = async () => {
	await navigator.serviceWorker.register( '/service-worker.js' );
	const existingSubscription = await getSubscriptionState();

	if ( existingSubscription ) {
		return existingSubscription;
	}

	const subscription = await activateSubscription();
	return subscription;
};

export const unregisterServiceWorker = async () => {
	const registration = await navigator.serviceWorker.getRegistration( '/service-worker.js' );
	return registration?.unregister();
};

export const getPushNotificationState = async (): Promise< PushNotificationStatus > => {
	if ( ! isSupported() ) {
		return 'not-supported';
	}

	try {
		return await getPermissionState();
	} catch ( error ) {
		return 'not-supported';
	}
};
