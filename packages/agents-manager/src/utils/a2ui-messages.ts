import type { UIMessage } from '@automattic/agenttic-client';

export function isA2uiActionMessage( message: UIMessage ): boolean {
	const text = message.content[ 0 ]?.text;
	if ( message.role !== 'user' || ! text ) {
		return false;
	}
	try {
		const payload = JSON.parse( text );
		const action = payload?.action;
		return (
			payload?.version === 'v0.9' &&
			Object.keys( payload ).length === 2 &&
			action !== null &&
			typeof action === 'object' &&
			[ 'name', 'surfaceId', 'sourceComponentId', 'timestamp' ].every(
				( key ) => typeof action[ key ] === 'string'
			) &&
			action.context !== null &&
			typeof action.context === 'object' &&
			! Array.isArray( action.context )
		);
	} catch {
		return false;
	}
}
