import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useLocale } from '@automattic/i18n-utils';
import { getSignupUrl, pathWithLeadingSlash } from 'calypso/lib/login';
import { useDispatch, useSelector } from 'calypso/state';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { isUserLoggedIn, getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import { getCurrentQueryArguments } from 'calypso/state/selectors/get-current-query-arguments';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';

interface UseSignupLinkParams {
	/**
	 * `signupUrl` should merge with `getSignupLinkComponent` logic in `/client/blocks/login/index.js`,
	 * so we have a single source for this logic.
	 */
	signupUrl?: string;
	/**
	 * Distinguishes the top-bar link from the footer line in Tracks.
	 */
	origin: string;
}

/**
 * The signup destination and its click handling, shared by the top bar's "Create an account"
 * and the login footer's "Don't have an account? Sign up". Both routes to signup have to agree
 * on the URL and on logging a signed-in user out first, so they resolve it in one place rather
 * than each rebuilding it.
 */
export default function useSignupLink( { signupUrl, origin }: UseSignupLinkParams ) {
	const urlLocale = useLocale();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const userLocale = useSelector( getCurrentUserLocale );
	// For logged-in users, use their user locale setting. For logged-out users, use URL locale.
	const locale = isLoggedIn && userLocale ? userLocale : urlLocale;
	const currentRoute = useSelector( getCurrentRoute );
	const currentQuery = useSelector( getCurrentQueryArguments );
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const dispatch = useDispatch();

	// use '?signup_url' if explicitly passed as URL query param
	const href: string = signupUrl
		? window.location.origin + pathWithLeadingSlash( signupUrl )
		: getSignupUrl( currentQuery, currentRoute, oauth2Client, locale );

	const onClick = ( event: React.MouseEvent< HTMLElement > ) => {
		recordTracksEvent( 'calypso_login_sign_up_link_click', { origin } );

		if ( isLoggedIn ) {
			event.preventDefault();
			dispatch( redirectToLogout( href ) );
		}
	};

	return { href, onClick };
}
