/**
 * Retrieves the sessionID from the provided search string.
 * @param search - The search string to extract the sessionID from, defaults to window.location.search.
 * @returns sessionId or null.
 */
export function getSessionId( search = window.location.search ) {
	const searchParams = new URLSearchParams( search );
	const sessionId = searchParams.get( 'sessionId' );
	return sessionId;
}
