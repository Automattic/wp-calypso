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

	let flow = 'start';
	// TODO: I am restricting this to certain flows for testing sake, but I think this should be the default behavior.
	if ( flowName === 'ai-site-builder' && socialService === 'github' ) {
		flow = `setup/${ flowName }`;
	}

	let protocol = 'https';
	if ( typeof window !== 'undefined' && window.location.hostname === 'calypso.localhost' ) {
		protocol = 'http';
	}

	return isLogin
		? `${ protocol }://${ host + login( { socialService } ) }`
		: `${ protocol }://${ host }/${ flow }/user`;
};
