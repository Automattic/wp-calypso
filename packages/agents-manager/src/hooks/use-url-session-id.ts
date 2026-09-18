import { useEffect, useRef } from '@wordpress/element';
import { isSiteEditorContext } from '../utils/site-editor-context';

const URL_SESSION_PARAM = 'wp-agent-chat';

function getUrlSessionId(): string {
	if ( typeof window === 'undefined' ) {
		return '';
	}

	return new URL( window.location.href ).searchParams.get( URL_SESSION_PARAM ) || '';
}

/**
 * Captures the chat session from the URL before host loading gates can rewrite
 * it, then removes the parameter without losing the captured value.
 */
export function useUrlSessionId(): string {
	const urlSessionIdRef = useRef( getUrlSessionId() );

	useEffect( () => {
		if ( ! urlSessionIdRef.current ) {
			return;
		}

		const url = new URL( window.location.href );
		if ( ! url.searchParams.has( URL_SESSION_PARAM ) ) {
			return;
		}

		url.searchParams.delete( URL_SESSION_PARAM );
		window.history.replaceState( window.history.state, '', url );
		// `@wordpress/router` only refreshes its cached location on `popstate`.
		// Other hosts' routers would treat the event as a back/forward navigation.
		if ( isSiteEditorContext() ) {
			window.dispatchEvent( new PopStateEvent( 'popstate', { state: window.history.state } ) );
		}
	}, [] );

	return urlSessionIdRef.current;
}
