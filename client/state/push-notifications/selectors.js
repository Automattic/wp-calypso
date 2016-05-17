
// `getState().pushNotifications.system`
export const isApiReady = ( state ) => !! state.pushNotifications.system.apiReady;
export const isAuthorized = ( state ) => !! state.pushNotifications.system.authorized;
export const isAuthorizationLoaded = ( state ) => !! state.pushNotifications.system.authorizationLoaded;
export const isBlocked = ( state ) => !! state.pushNotifications.system.blocked;
export const getSavedWPCOMSubscription = ( state ) => state.pushNotifications.system.wpcomSubscription;

// `getState().pushNotifications.settings`
export const isEnabled = ( state ) => !! state.pushNotifications.settings.enabled;
export const isNoticeDismissed = ( state ) => !! state.pushNotifications.settings.dismissedNotice;
export const isShowingUnblockInstructions = ( state ) => !! state.pushNotifications.settings.showingUnblockInstructions;

export function getDeviceId( state ) {
	const subscription = getSavedWPCOMSubscription( state );
	if ( ! subscription ) {
		return;
	}
	return subscription.ID;
}

export function getLastUpdated( state ) {
	const wpcomSubscription = getSavedWPCOMSubscription( state );
	if ( ! wpcomSubscription ) {
		return;
	}
	return wpcomSubscription.lastUpdated;
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
