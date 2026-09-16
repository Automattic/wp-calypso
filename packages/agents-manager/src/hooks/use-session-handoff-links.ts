import { useEffect } from '@wordpress/element';
import { useAgentsManagerContext } from '../contexts';
import { getSessionId, NO_SITE } from '../utils/agent-session';
import { addSessionHandoff, isHandoffAgent, isHandoffDestination } from '../utils/session-handoff';

/**
 * Carries this tab's session across origins: a plain click on a link to
 * another Agents Manager origin navigates there with the session in the URL.
 * Runs after the host's own handlers, so clicks they handled and new-tab
 * gestures are left alone, and a new tab still starts fresh.
 */
export function useSessionHandoffLinks( agentId?: string ): void {
	const { site, siteKey, currentUser } = useAgentsManagerContext();
	const userId = currentUser?.ID;
	const siteDomain = site?.domain;

	useEffect( () => {
		// A chat without a site scope has no page on another origin to resume on.
		if ( ! isHandoffAgent( agentId ) || siteKey === NO_SITE ) {
			return;
		}

		function onClick( event: MouseEvent ): void {
			if (
				event.defaultPrevented ||
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey
			) {
				return;
			}

			const anchor = event.target instanceof Element ? event.target.closest( 'a[href]' ) : null;
			if ( ! ( anchor instanceof HTMLAnchorElement ) ) {
				return;
			}

			const target = anchor.target.toLowerCase();
			if (
				( target && target !== '_self' ) ||
				anchor.hasAttribute( 'download' ) ||
				! isHandoffDestination( anchor, window.location.origin, siteDomain )
			) {
				return;
			}

			const sessionId = getSessionId( agentId, siteKey, userId );
			if ( ! sessionId ) {
				return;
			}

			event.preventDefault();
			window.location.assign( addSessionHandoff( anchor.href, sessionId, siteKey ) );
		}

		document.addEventListener( 'click', onClick );
		return () => document.removeEventListener( 'click', onClick );
	}, [ agentId, siteDomain, siteKey, userId ] );
}
