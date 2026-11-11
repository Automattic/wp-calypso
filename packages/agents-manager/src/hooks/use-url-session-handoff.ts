import { useEffect, useState } from '@wordpress/element';
import {
	readSessionHandoff,
	SESSION_HANDOFF_PARAM,
	SITE_HANDOFF_PARAM,
	type SessionHandoff,
} from '../utils/session-handoff';
import { isSiteEditorContext } from '../utils/site-editor-context';

function getUrlSessionHandoff(): SessionHandoff | null {
	return typeof window === 'undefined' ? null : readSessionHandoff( window.location.search );
}

/**
 * Captures the chat session handed off in the URL before host loading gates
 * can rewrite it, then removes the parameters without losing the captured value.
 */
export function useUrlSessionHandoff(): SessionHandoff | null {
	const [ handoff ] = useState( getUrlSessionHandoff );

	useEffect( () => {
		if ( ! handoff ) {
			return;
		}

		const url = new URL( window.location.href );
		if ( ! url.searchParams.has( SESSION_HANDOFF_PARAM ) ) {
			return;
		}

		url.searchParams.delete( SESSION_HANDOFF_PARAM );
		url.searchParams.delete( SITE_HANDOFF_PARAM );
		window.history.replaceState( window.history.state, '', url );
		// `@wordpress/router` only refreshes its cached location on `popstate`.
		// Other hosts' routers would treat the event as a back/forward navigation.
		if ( isSiteEditorContext() ) {
			window.dispatchEvent( new PopStateEvent( 'popstate', { state: window.history.state } ) );
		}
	}, [ handoff ] );

	return handoff;
}
