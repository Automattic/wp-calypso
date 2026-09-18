import { PLANS_PRESALES_LAUNCHER_CONTEXT } from '@automattic/odie-client/src/constants';
import { addQueryArgs } from '@wordpress/url';
import type { LoggedOutOdieChat } from '@automattic/data-stores';

// A bare /odie open of the presales launcher resumes the saved logged-out
// conversation; every other route or context passes through unchanged.
export function getPresalesResumeRoute(
	route: string,
	launcherContext: string | undefined,
	chat: LoggedOutOdieChat | undefined
): string {
	if ( route !== '/odie' || launcherContext !== PLANS_PRESALES_LAUNCHER_CONTEXT || ! chat ) {
		return route;
	}
	return addQueryArgs( '/odie', {
		chatId: chat.odieId,
		sessionId: chat.sessionId,
		botSlug: chat.botSlug,
	} );
}
