import type {
	AgentsApiMessage,
	AgentsApiRunEvent,
	AgentsApiSession,
	AgentsApiToolGroup,
	AgentsApiToolRenderers,
} from './types';

function asRecord( value: unknown ): Record< string, unknown > {
	return value && typeof value === 'object'
		? ( value as Record< string, unknown > )
		: {};
}

function asString( value: unknown, fallback = '' ): string {
	return typeof value === 'string' ? value : fallback;
}

function normalizeRole(
	role: unknown,
	fallbackRole: 'user' | 'agent'
): 'user' | 'agent' {
	if ( role === 'user' ) {
		return 'user';
	}
	if ( role === 'agent' || role === 'assistant' ) {
		return 'agent';
	}
	return fallbackRole;
}

function normalizeTimestamp( value: unknown ): number {
	if ( typeof value === 'number' ) {
		return value;
	}
	if ( typeof value === 'string' ) {
		return Date.parse( value ) || now();
	}
	return now();
}

function getConversationItems( value: Record< string, unknown > ): unknown[] {
	if ( Array.isArray( value.conversation ) ) {
		return value.conversation;
	}
	if ( Array.isArray( value.messages ) ) {
		return value.messages;
	}
	return [];
}

function now(): number {
	return Date.now();
}

function stableHash( value: string ): string {
	let hash = 0;
	for ( let i = 0; i < value.length; i++ ) {
		hash = ( hash << 5 ) - hash + value.charCodeAt( i );
		hash |= 0;
	}
	return Math.abs( hash ).toString( 36 );
}

export function normalizeAgentsApiMessage(
	input: unknown,
	fallbackRole: 'user' | 'agent' = 'agent',
	fallbackIndex = 0
): AgentsApiMessage {
	const raw = asRecord( input );
	const role = normalizeRole( raw.role, fallbackRole );
	const text =
		asString( raw.content ) ||
		asString( raw.text ) ||
		asString( raw.message );
	const timestampValue = raw.timestamp ?? raw.created_at ?? raw.createdAt;
	const timestamp = normalizeTimestamp( timestampValue );
	const timestampIdPart =
		typeof timestampValue === 'string' || typeof timestampValue === 'number'
			? String( timestampValue )
			: '';
	const id =
		asString( raw.id ) ||
		asString( raw.message_id ) ||
		`${ role }-${ stableHash(
			`${ fallbackIndex }:${ timestampIdPart }:${ text }`
		) }`;
	const content = Array.isArray( raw.content )
		? raw.content
		: [ { type: 'text' as const, text } ];

	return {
		id,
		role,
		content: content as AgentsApiMessage[ 'content' ],
		timestamp,
		archived: false,
		showIcon: role === 'agent',
		disabled: false,
		reactKey: id,
		attachments: Array.isArray( raw.attachments )
			? raw.attachments
			: undefined,
		metadata: asRecord( raw.metadata ),
		raw,
	};
}

export function normalizeConversation( input: unknown ): AgentsApiMessage[] {
	const value = asRecord( input );
	const conversation = getConversationItems( value );
	return conversation.map( ( message, index ) =>
		normalizeAgentsApiMessage( message, 'agent', index )
	);
}

export function normalizeSendResponse(
	response: unknown,
	message: string,
	attachments: AgentsApiMessage[ 'attachments' ] = []
): {
	sessionId: string | null;
	runId?: string;
	messages: AgentsApiMessage[];
	metadata: Record< string, unknown >;
} {
	const envelope = asRecord( response );
	const data = asRecord( envelope.data ?? response );
	let messages = normalizeConversation( data );
	if ( messages.length === 0 ) {
		messages = [
			normalizeAgentsApiMessage(
				{ role: 'user', content: message, attachments },
				'user'
			),
			normalizeAgentsApiMessage(
				{ role: 'agent', content: asString( data.response ) },
				'agent'
			),
		];
	}
	return {
		sessionId: asString( data.session_id ) || null,
		runId: asString( data.run_id ) || undefined,
		messages,
		metadata: asRecord( data.metadata ),
	};
}

export function normalizeSessions( response: unknown ): AgentsApiSession[] {
	const envelope = asRecord( response );
	const data = asRecord( envelope.data ?? response );
	const sessions = Array.isArray( data.sessions ) ? data.sessions : [];
	return sessions
		.map( ( item ) => {
			const raw = asRecord( item );
			return {
				id: asString( raw.id ) || asString( raw.session_id ),
				title: asString( raw.title ) || asString( raw.label ),
				updated_at:
					asString( raw.updated_at ) || asString( raw.updatedAt ),
				updatedAt:
					asString( raw.updatedAt ) || asString( raw.updated_at ),
				created_at:
					asString( raw.created_at ) || asString( raw.createdAt ),
				createdAt:
					asString( raw.createdAt ) || asString( raw.created_at ),
				unread_count:
					typeof raw.unread_count === 'number' ? raw.unread_count : 0,
				metadata: asRecord( raw.metadata ),
			};
		} )
		.filter( ( session ) => session.id );
}

export function normalizeLoadedSession( response: unknown ): {
	sessionId: string | null;
	messages: AgentsApiMessage[];
	metadata: Record< string, unknown >;
} {
	const envelope = asRecord( response );
	const data = asRecord( envelope.data ?? response );
	return {
		sessionId: asString( data.session_id ) || null,
		messages: normalizeConversation( data ),
		metadata: asRecord( data.metadata ),
	};
}

export function normalizeRunEvent(
	input: unknown,
	fallbackRunId = ''
): AgentsApiRunEvent | null {
	const raw = asRecord( input );
	const type = asString( raw.type ) || asString( raw.event );
	if ( ! type ) {
		return null;
	}
	const runId = asString( raw.run_id ) || fallbackRunId;
	return {
		id:
			asString( raw.id ) ||
			`${ runId }-${ type }-${ asString( raw.cursor ) }`,
		run_id: runId,
		session_id: asString( raw.session_id ) || undefined,
		type,
		status: asString( raw.status ) || undefined,
		metadata: asRecord( raw.metadata ),
		raw,
	};
}

export function groupToolMessages(
	messages: AgentsApiMessage[]
): AgentsApiToolGroup[] {
	return messages.flatMap< AgentsApiToolGroup >( ( message ) => {
		const raw = message.raw ?? {};
		const metadata = message.metadata ?? {};
		const toolData = asRecord( metadata.tool_data ?? raw.tool_data );
		const name =
			asString( raw.tool_name ) ||
			asString( raw.name ) ||
			asString( metadata.tool_name ) ||
			asString( toolData.tool_name );
		if ( ! name ) {
			return [];
		}
		const type = asString( metadata.type ) || asString( raw.type );
		const id =
			asString( metadata.tool_call_id ) ||
			asString( raw.tool_call_id ) ||
			message.id;
		const parameters = asRecord(
			metadata.parameters ?? raw.parameters ?? toolData.parameters
		);
		const result = asRecord(
			toolData.result ?? raw.result ?? metadata.result ?? toolData
		);

		if ( type === 'tool_call' ) {
			return [
				{
					id,
					name,
					call: {
						id,
						message,
						args: parameters,
					},
				},
			];
		}

		return [
			{
				id,
				name,
				result: {
					id,
					message,
					result,
				},
			},
		];
	} );
}

export function renderToolGroups(
	groups: AgentsApiToolGroup[],
	renderers: AgentsApiToolRenderers = {}
) {
	return groups.map(
		( group ) => renderers[ group.name ]?.( group ) ?? null
	);
}
