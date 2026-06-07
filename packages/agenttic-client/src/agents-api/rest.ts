import type { AgentsApiChatAdapter, AgentsApiFetch } from './types';

export function createAgentsApiChatAdapter( {
	agent,
	basePath,
	fetchFn,
}: {
	agent?: string;
	basePath: string;
	fetchFn: AgentsApiFetch;
} ): AgentsApiChatAdapter {
	const path = ( suffix: string ) => `${ basePath }${ suffix }`;
	const withAgentPath = ( value: string ) => {
		if ( ! agent ) {
			return value;
		}
		const separator = value.includes( '?' ) ? '&' : '?';
		return `${ value }${ separator }agent=${ encodeURIComponent( agent ) }`;
	};
	const withAgent = ( data: Record< string, unknown > = {} ) =>
		agent ? { ...data, agent } : data;

	return {
		sendMessage: ( input ) =>
			fetchFn( {
				path: path( '' ),
				method: 'POST',
				data: withAgent( {
					message: input.message,
					session_id: input.sessionId ?? '',
					attachments: input.attachments ?? [],
				} ),
			} ),
		listSessions: () =>
			fetchFn( { path: withAgentPath( path( '/sessions' ) ) } ),
		loadSession: ( sessionId ) =>
			fetchFn( {
				path: withAgentPath(
					path( `/${ encodeURIComponent( sessionId ) }` )
				),
			} ),
		markSessionRead: ( sessionId ) =>
			fetchFn( {
				path: withAgentPath(
					path(
						`/sessions/${ encodeURIComponent( sessionId ) }/read`
					)
				),
				method: 'POST',
			} ),
		deleteSession: ( sessionId ) =>
			fetchFn( {
				path: withAgentPath(
					path( `/${ encodeURIComponent( sessionId ) }` )
				),
				method: 'DELETE',
			} ),
	};
}

export const agentsApiSendMessage = (
	adapter: AgentsApiChatAdapter,
	...args: Parameters< AgentsApiChatAdapter[ 'sendMessage' ] >
) => adapter.sendMessage( ...args );

export const agentsApiListSessions = ( adapter: AgentsApiChatAdapter ) =>
	adapter.listSessions();

export const agentsApiLoadSession = (
	adapter: AgentsApiChatAdapter,
	sessionId: string
) => adapter.loadSession( sessionId );

export const agentsApiMarkSessionRead = (
	adapter: AgentsApiChatAdapter,
	sessionId: string
) => adapter.markSessionRead( sessionId );

export const agentsApiDeleteSession = (
	adapter: AgentsApiChatAdapter,
	sessionId: string
) => adapter.deleteSession( sessionId );

export const agentsApiContinueResponse = agentsApiSendMessage;
