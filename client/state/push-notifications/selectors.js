import 'calypso/state/push-notifications/init';

// `getState().pushNotifications.system`
export const isApiReady = ( state ) => !! state.pushNotifications.system.apiReady;
export const isBlocked = ( state ) => !! state.pushNotifications.system.blocked;
export const getSavedWPCOMSubscription = ( state ) =>
	state.pushNotifications.system.wpcomSubscription;

// `getState().pushNotifications.settings`
export const isEnabled = ( state ) => !! state.pushNotifications.settings.enabled;

export function getDeviceId( state ) {
	const subscription = getSavedWPCOMSubscription( state );
	if ( ! subscription ) {
		return;
	}
	return subscription.ID;
}

export function getStatus( state ) {
	if ( ! isApiReady( state ) ) {
		return 'unknown';
	}

	if ( isBlocked( state ) ) {
		return 'denied';
	}

	const wpcomSubscription = getSavedWPCOMSubscription( state );

	if ( isEnabled( state ) ) {
		if ( wpcomSubscription ) {
			return 'subscribed';
		}
		return 'enabling';
	}

	if ( wpcomSubscription ) {
		return 'disabling';
	}
	return 'unsubscribed';
}
