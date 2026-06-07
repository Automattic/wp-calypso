import type { AgentsApiChatAdapter, AgentsApiFetch } from './types';

export function createAgentsApiChatAdapter( {
	basePath,
	fetchFn,
}: {
	basePath: string;
	fetchFn: AgentsApiFetch;
} ): AgentsApiChatAdapter {
	const path = ( suffix: string ) => `${ basePath }${ suffix }`;

	return {
		sendMessage: ( input ) =>
			fetchFn( {
				path: path( '' ),
				method: 'POST',
				data: {
					message: input.message,
					session_id: input.sessionId ?? '',
					attachments: input.attachments ?? [],
				},
			} ),
		listSessions: () => fetchFn( { path: path( '/sessions' ) } ),
		loadSession: ( sessionId ) =>
			fetchFn( {
				path: path( `/${ encodeURIComponent( sessionId ) }` ),
			} ),
		markSessionRead: ( sessionId ) =>
			fetchFn( {
				path: path(
					`/sessions/${ encodeURIComponent( sessionId ) }/read`
				),
				method: 'POST',
			} ),
		deleteSession: ( sessionId ) =>
			fetchFn( {
				path: path( `/${ encodeURIComponent( sessionId ) }` ),
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
