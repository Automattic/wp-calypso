import { pointsAtLoginPage, resolvePostLoginRedirect } from 'calypso/lib/login-redirect-safety';
import { clearStore, getStoredUserId } from 'calypso/lib/user/store';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { getRedirectToSanitized, isTwoFactorEnabled } from 'calypso/state/login/selectors';
import type { CalypsoDispatch } from 'calypso/state/types';

export const rebootAfterLogin =
	( tracksEventArgs: Record< string, unknown > ) =>
	async ( dispatch: CalypsoDispatch, getState: () => Record< string, unknown > ) => {
		const redirectTo = getRedirectToSanitized( getState() );

		// The login app's store has no sites state, so the landing resolver can't run here.
		const url = resolvePostLoginRedirect( redirectTo ) || '/home';

		dispatch(
			recordTracksEvent( 'calypso_login_success', {
				two_factor_enabled: isTwoFactorEnabled( getState() ),
				// How often the redirect we are handed points back at the login
				// page. Until this fires in production we cannot say how much of
				// the reported login loop is this and how much is something else.
				redirect_to_login_page: pointsAtLoginPage( redirectTo ),
				...tracksEventArgs,
			} )
		);

		// user ID is persisted in localstorage
		// therefore we need to reset it before we redirect, otherwise we'll get
		// mixed data from old and new user
		if ( getStoredUserId() ) {
			await clearStore();
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
