import { login } from 'calypso/lib/paths';
import { isWpccFlow } from 'calypso/signup/is-flow';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getCurrentFlowName } from 'calypso/state/signup/flow/selectors';
import type { AppState } from 'calypso/types';

export const getUxMode = ( state: AppState ) => {
	const currentRoute = getCurrentRoute( state );
	const oauth2Client = getCurrentOAuth2Client( state );

	// If calypso is loaded in a popup, we don't want to open a second popup for social signup or login
	// let's use the redirect flow instead in that case
	let shouldRedirect = typeof window !== 'undefined' && window.opener && window.opener !== window;

	// Jetpack Connect-in-place auth flow contains special reserved args, so we want a popup for social signup and login.
	// See p1HpG7-7nj-p2 for more information.
	if (
		shouldRedirect &&
		[ '/jetpack/connect/authorize', '/log-in/jetpack' ].includes( currentRoute )
	) {
		shouldRedirect = false;
	}

	// disable for oauth2 flows for now
	return ! oauth2Client && shouldRedirect ? 'redirect' : 'popup';
};

export const getRedirectUri = (
	socialService: 'google' | 'apple' | 'github',
	state: AppState,
	isLogin: boolean
) => {
	const flowName = getCurrentFlowName( state );
	const host = typeof window !== 'undefined' && window.location.host;

	// If the user is in the WPCC flow, we want to redirect user to login callback so that we can automatically log them in.
	if ( isWpccFlow( flowName ) ) {
		return `https://${ host + login( { socialService } ) }`;
	}

	if ( typeof window !== 'undefined' && window.location.hostname === 'calypso.localhost' ) {
		return isLogin
			? `http://${ host + login( { socialService } ) }`
			: `http://${ host }/start/user`;
	}

	return isLogin
		? `https://${ host + login( { socialService } ) }`
		: `https://${ host }/start/user`;
};
