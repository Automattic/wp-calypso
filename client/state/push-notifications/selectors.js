
export const isApiReady = ( state ) => !! state.pushNotifications.settings.apiReady;
export const isAuthorized = ( state ) => !! state.pushNotifications.settings.authorized;
export const isAuthorizationLoaded = ( state ) => !! state.pushNotifications.settings.authorizationLoaded;
export const isBlocked = ( state ) => !! state.pushNotifications.settings.blocked;
export const isEnabled = ( state ) => !! state.pushNotifications.settings.enabled;
export const isNoticeDismissed = ( state ) => !! state.pushNotifications.settings.dismissedNotice;
export const isShowingUnblockInstructions = ( state ) => !! state.pushNotifications.settings.showingUnblockInstructions;
export const getSavedSubscription = ( state ) => state.pushNotifications.settings.subscription;
export const getSavedWPCOMSubscription = ( state ) => state.pushNotifications.settings.wpcomSubscription;

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

	const subscription = getSavedSubscription( state );

	if ( isEnabled( state ) ) {
		if ( subscription ) {
			return 'subscribed';
		}
		return 'enabling';
	}

	if ( subscription ) {
		return 'disabling';
	}
	return 'unsubscribed';
}
