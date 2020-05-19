/**
 * External dependencies
 */
import type { Dispatch } from 'redux';

/**
 * Internal dependencies
 */
import userFactory from 'lib/user';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import { getRedirectToSanitized, isTwoFactorEnabled } from 'state/login/selectors';

const user = userFactory();

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
	if ( user.get() ) {
		await user.clear();
	}

	window.location.href = url;
};
