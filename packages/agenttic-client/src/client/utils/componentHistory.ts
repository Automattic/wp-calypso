import type { Message, TaskUpdate } from '../types/index';

const HISTORY_TEXT = 'Interactive component shown in this conversation.';

function isComponentTool( toolId: unknown ): boolean {
	return (
		typeof toolId === 'string' &&
		[
			'wpcom/render-components',
			'wpcom/component-action',
			'wpcom__render_components',
			'wpcom__component_action',
		].includes( toolId )
	);
}

function isComponentPayload( value: Record< string, unknown > ): boolean {
	return (
		typeof value.protocol === 'string' &&
		/^(agent-component|minimal-ai-ui)\//.test( value.protocol )
	);
}

function opaqueReference( value: unknown ): Record< string, unknown > {
	if ( ! value || typeof value !== 'object' ) {
		return {};
	}
	const data = value as Record< string, unknown >;
	return typeof data.instanceId === 'string' ? { instanceId: data.instanceId } : {};
}

function redactComponentData( value: unknown, toolIds = new Map< string, string >() ): unknown {
	if ( typeof value === 'string' ) {
		if ( ! value.trimStart().startsWith( '{' ) && ! value.trimStart().startsWith( '[' ) ) {
			return value;
		}
		try {
			const parsed: unknown = JSON.parse( value );
			const redacted = redactComponentData( parsed, toolIds );
			return JSON.stringify( redacted ) === JSON.stringify( parsed )
				? value
				: JSON.stringify( redacted );
		} catch {
			return /^\s*(?:\{\s*"|\[\s*\{)/.test( value ) &&
				/agent-component\/|minimal-ai-ui\/|wpcom(?:\/|__)render[-_]components|wpcom(?:\/|__)component[-_]action/.test(
					value
				)
				? HISTORY_TEXT
				: value;
		}
	}
	if ( Array.isArray( value ) ) {
		return value.map( ( item ) => redactComponentData( item, toolIds ) );
	}
	if (
		! value ||
		typeof value !== 'object' ||
		Object.getPrototypeOf( value ) !== Object.prototype
	) {
		return value;
	}
	const data = value as Record< string, unknown >;
	if (
		isComponentTool(
			data.toolId ?? data.tool_id ?? data.name ?? toolIds.get( data.toolCallId as string )
		) &&
		( 'toolCallId' in data || 'tool_id' in data || 'arguments' in data || 'result' in data )
	) {
		return {
			...( typeof data.toolCallId === 'string' && { toolCallId: data.toolCallId } ),
			...( typeof data.toolId === 'string' && { toolId: data.toolId } ),
			...( 'arguments' in data && { arguments: opaqueReference( data.arguments ) } ),
			...( 'result' in data && {
				result: { ...opaqueReference( data.result ), message: HISTORY_TEXT },
			} ),
		};
	}
	if ( isComponentPayload( data ) ) {
		return { ...opaqueReference( data ), message: HISTORY_TEXT };
	}
	return Object.fromEntries(
		Object.entries( data ).map( ( [ key, item ] ) => [ key, redactComponentData( item, toolIds ) ] )
	);
}

export function redactComponentMessage( message: Message ): Message {
	return redactComponentMessages( [ message ] )[ 0 ];
}

export function redactComponentMessages( messages: Message[] ): Message[] {
	const toolIds = new Map< string, string >();
	for ( const message of messages ) {
		for ( const part of message.parts ) {
			if (
				part.type === 'data' &&
				'toolCallId' in part.data &&
				'toolId' in part.data &&
				typeof part.data.toolCallId === 'string' &&
				typeof part.data.toolId === 'string'
			) {
				toolIds.set( part.data.toolCallId, part.data.toolId );
			}
		}
	}
	return messages.map( ( message ) => redactComponentData( message, toolIds ) as Message );
}

export function redactComponentTaskUpdate( update: TaskUpdate ): TaskUpdate {
	const projected = redactComponentData( update ) as TaskUpdate;
	const messages = redactComponentMessages(
		[ update.status?.message, update.agentMessage ].filter(
			( message ): message is Message => !! message
		)
	);
	if ( update.status?.message ) {
		projected.status = {
			...projected.status,
			message: messages.shift(),
		};
	}
	if ( update.agentMessage ) {
		projected.agentMessage = messages.shift();
	}
	return projected;
}
