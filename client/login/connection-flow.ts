import { isUnifiedFlow } from 'calypso/jetpack-connect/entry-points';

interface ConnectionFlowQuery {
	from?: string | null;
	plugins?: string | null;
}

/**
 * Whether the login screen is part of the unified connection flow, and which
 * plugins its content is for. Reads `from` and `plugins` from the `redirect_to`
 * URL first, then from the login page's own query.
 */
export function getConnectionFlowFromRedirectTo(
	redirectToOriginal?: string | null,
	currentQuery?: ConnectionFlowQuery | null
): { isUnifiedConnectionFlow: boolean; connectorPlugins: string[]; connectorFrom: string | null } {
	const redirectToParams = new URLSearchParams( redirectToOriginal?.split( '?' )[ 1 ] );
	const from = redirectToParams.get( 'from' ) || currentQuery?.from || null;
	const isUnifiedConnectionFlow = isUnifiedFlow( from );
	const rawPlugins = isUnifiedConnectionFlow
		? redirectToParams.get( 'plugins' ) || currentQuery?.plugins || ''
		: '';
	return {
		isUnifiedConnectionFlow,
		connectorFrom: from,
		connectorPlugins: rawPlugins
			.split( ',' )
			.map( ( s ) => s.trim() )
			.filter( Boolean ),
	};
}
