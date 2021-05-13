/**
 * External dependencies
 */
import type { Dispatch } from 'redux';

/**
 * Internal dependencies
 */
import user from 'calypso/lib/user';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { getRedirectToSanitized, isTwoFactorEnabled } from 'calypso/state/login/selectors';

export const rebootAfterLogin = ( tracksEventArgs: object ) => async (
	dispatch: Dispatch,
	getState: () => object
) => {
	dispatch(
		recordTracksEvent( 'calypso_login_success', {
			two_factor_enabled: isTwoFactorEnabled( getState() ),
			...tracksEventArgs,
		} )
	);

	// Redirects to / if no redirect url is available
	const url = getRedirectToSanitized( getState() ) || '/';

	// user data is persisted in localstorage at `lib/user/user` line 157
	// therefore we need to reset it before we redirect, otherwise we'll get
	// mixed data from old and new user
	if ( user().get() ) {
		await user().clear();
	}

	// We want to differentiate users going to `/oauth2/authorize` that are coming from
	// the login flow by setting the `login_flow` query parameter. The other case would be
	// users going directly to `/oauth2/authorize` because they're already logged in WPCOM.
	if ( url.startsWith( 'https://public-api.wordpress.com/oauth2/authorize' ) ) {
		const newUrl = new URL( url );
		newUrl.searchParams.append( 'login_flow', 'true' );
		window.location.href = newUrl.toString();
		return;
	}

	window.location.href = url;
};
