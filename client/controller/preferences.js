import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { fetchPreferences } from 'calypso/state/preferences/actions';
import { hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';

export async function setupPreferences( context, next ) {
	const state = context.store.getState();
	if ( ! isUserLoggedIn( state ) || hasReceivedRemotePreferences( state ) ) {
		next();
		return;
	}

	try {
		await context.store.dispatch( fetchPreferences() );
	} catch {
		// if the fetching of preferences fails, do nothing.
	}

	next();
}
