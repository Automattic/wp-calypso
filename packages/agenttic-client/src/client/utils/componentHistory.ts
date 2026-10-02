import type {
	ComponentFallbackMetadata,
	ComponentCapabilities,
	ComponentReferencePart,
	ComponentResultPart,
	Message,
	Part,
	TaskUpdate,
} from '../types/index';

export const GENERIC_COMPONENT_HISTORY_TEXT = 'Interactive component shown in this conversation.';
const HISTORY_TEXT = GENERIC_COMPONENT_HISTORY_TEXT;

function isRecord( value: unknown ): value is Record< string, unknown > {
	return (
		!! value &&
		typeof value === 'object' &&
		! Array.isArray( value ) &&
		( Object.getPrototypeOf( value ) === Object.prototype ||
			Object.getPrototypeOf( value ) === null )
	);
}

function isIdentifier( value: unknown, maxLength = 64 ): value is string {
	return (
		typeof value === 'string' &&
		value.length > 0 &&
		value.length <= maxLength &&
		/^[a-zA-Z0-9_.:-]+$/.test( value ) &&
		! [ '__proto__', 'constructor', 'prototype' ].includes( value )
	);
}

function hasKeys( value: Record< string, unknown >, keys: string[] ): boolean {
	return (
		Object.keys( value ).length === keys.length &&
		keys.every( ( key ) => Object.hasOwn( value, key ) )
	);
}

export function getComponentFallbackMetadata(
	metadata: unknown
): ComponentFallbackMetadata | undefined {
	if ( ! isRecord( metadata ) || ! isRecord( metadata.componentFallback ) ) {
		return undefined;
	}
	const fallback = metadata.componentFallback;
	if (
		! hasKeys( fallback, [ 'partVersion', 'toolCallId' ] ) ||
		fallback.partVersion !== 1 ||
		! isIdentifier( fallback.toolCallId, 128 )
	) {
		return undefined;
	}
	return { componentFallback: { partVersion: 1, toolCallId: fallback.toolCallId } };
}

export function getComponentCapabilities( value: unknown ): ComponentCapabilities | undefined {
	if (
		! isRecord( value ) ||
		! hasKeys( value, [ 'supported' ] ) ||
		! Array.isArray( value.supported ) ||
		value.supported.length > 1 ||
		! [ ...value.supported ].every(
			( tuple ) =>
				isRecord( tuple ) &&
				hasKeys( tuple, [ 'partVersion', 'protocol', 'catalog' ] ) &&
				tuple.partVersion === 1 &&
				tuple.protocol === 'agent-component/0.1' &&
				tuple.catalog === 'minimal-ai-ui/0.1'
		)
	) {
		return undefined;
	}
	return {
		supported: value.supported.map( () => ( {
			partVersion: 1,
			protocol: 'agent-component/0.1',
			catalog: 'minimal-ai-ui/0.1',
		} ) ),
	};
}

export function normalizeComponentResultPart( part: unknown ): ComponentResultPart | undefined {
	if (
		! isRecord( part ) ||
		part.type !== 'component-result' ||
		part.partVersion !== 1 ||
		! isIdentifier( part.toolCallId, 128 ) ||
		! hasKeys( part, [ 'type', 'partVersion', 'toolCallId', 'result' ] )
	) {
		return undefined;
	}
	return {
		type: 'component-result',
		partVersion: 1,
		toolCallId: part.toolCallId,
		result: part.result,
	};
}

function componentReference( part: unknown ): ComponentReferencePart | undefined {
	if ( ! isRecord( part ) || ! isIdentifier( part.toolCallId, 128 ) || part.partVersion !== 1 ) {
		return undefined;
	}
	const opening = part.type === 'component-result' ? part.result : part;
	const result = isRecord( opening ) && isRecord( opening.result ) ? opening.result : opening;
	if (
		! isRecord( result ) ||
		! isIdentifier( result.instanceId ) ||
		result.protocol !== 'agent-component/0.1' ||
		( part.type === 'component-reference' && result.catalog !== 'minimal-ai-ui/0.1' )
	) {
		return undefined;
	}
	return {
		type: 'component-reference',
		partVersion: 1,
		toolCallId: part.toolCallId,
		instanceId: result.instanceId,
		protocol: 'agent-component/0.1',
		catalog: 'minimal-ai-ui/0.1',
		summary: HISTORY_TEXT,
	};
}

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

function isComponentJson( value: string ): boolean {
	return (
		/^\s*(?:\{\s*"|\[\s*\{)/.test( value ) &&
		/agent-component\/|minimal-ai-ui\/|wpcom(?:\/|__)render[-_]components|wpcom(?:\/|__)component[-_]action|component-result|component-reference/.test(
			value
		)
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
			return isComponentJson( value ) ? HISTORY_TEXT : value;
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
		Array.isArray( data.parts ) &&
		data.parts.some(
			( part ) =>
				isRecord( part ) &&
				( part.type === 'component-result' ||
					part.type === 'component-reference' ||
					( part.type === 'data' &&
						isRecord( part.data ) &&
						isComponentTool( part.data.toolId ?? toolIds.get( part.data.toolCallId as string ) ) &&
						( 'arguments' in part.data || 'result' in part.data ) ) )
		)
	) {
		return redactComponentMessage( data as unknown as Message );
	}
	if ( data.type === 'component-result' || data.type === 'component-reference' ) {
		return componentReference( data ) ?? { message: HISTORY_TEXT };
	}
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

export function redactComponentToolResultMessage( message: Message ): Message {
	return {
		...( redactComponentData( { ...message, parts: [] } ) as Message ),
		parts: message.parts.map( ( part ) => redactComponentData( part ) as Part ),
	};
}

export function redactComponentMessages( messages: Message[] ): Message[] {
	const toolIds = new Map< string, string >();
	const componentCalls = new Set< string >();
	for ( const message of messages ) {
		for ( const part of message.parts ) {
			if ( part.type === 'component-result' || part.type === 'component-reference' ) {
				componentCalls.add( part.toolCallId );
			}
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
	return messages.map( ( message ) => {
		let hasComponent = false;
		let parts: Part[] = [];
		const references = new Set< string >();
		for ( const part of message.parts ) {
			const data = part.type === 'data' ? ( part.data as Record< string, unknown > ) : {};
			if ( part.type === 'component-result' || part.type === 'component-reference' ) {
				hasComponent = true;
				const reference = componentReference( part );
				if ( reference && ! references.has( reference.toolCallId ) ) {
					parts.push( reference );
					references.add( reference.toolCallId );
				}
				continue;
			}
			if ( part.type === 'text' && isComponentJson( part.text ) ) {
				hasComponent = true;
				parts.push( { type: 'text', text: HISTORY_TEXT } );
				continue;
			}
			if (
				part.type === 'data' &&
				( componentCalls.has( data.toolCallId as string ) ||
					( isComponentTool( data.toolId ?? toolIds.get( data.toolCallId as string ) ) &&
						( 'arguments' in data || 'result' in data ) ) )
			) {
				hasComponent = true;
				const result = data.result ?? data.arguments;
				const reference = componentReference( {
					type: 'component-result',
					partVersion: 1,
					toolCallId: data.toolCallId,
					result,
				} );
				if ( reference && ! references.has( reference.toolCallId ) ) {
					parts.push( reference );
					references.add( reference.toolCallId );
				}
				continue;
			}
			parts.push( redactComponentData( part, toolIds ) as Part );
		}
		const fallback = getComponentFallbackMetadata( message.metadata );
		if (
			hasComponent ||
			( message.metadata && Object.hasOwn( message.metadata, 'componentFallback' ) )
		) {
			parts = parts.filter( ( part ) => part.type !== 'text' );
			parts.push( { type: 'text', text: HISTORY_TEXT } );
		}
		const { componentFallback, ...metadata } = message.metadata ?? {};
		const safeMetadata =
			hasComponent || ( message.metadata && Object.hasOwn( message.metadata, 'componentFallback' ) )
				? Object.fromEntries(
						Object.entries( metadata ).filter( ( [ key ] ) =>
							[ 'timestamp', 'archived', 'deliveryStatus', 'serverId', 'chatId' ].includes( key )
						)
					)
				: metadata;
		return {
			...message,
			parts,
			...( message.metadata && { metadata: { ...safeMetadata, ...fallback } } ),
		};
	} );
}

export function projectComponentMessagesForReplay( messages: Message[] ): Message[] {
	return redactComponentMessages( messages ).map( ( message ) => {
		const { componentFallback, ...metadata } = message.metadata ?? {};
		return {
			...message,
			parts: message.parts.filter( ( part ) => part.type !== 'component-reference' ),
			...( message.metadata && { metadata } ),
		};
	} );
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
	if (
		[ update.status?.message, update.agentMessage ].some(
			( message ) =>
				message?.parts.some(
					( part ) => part.type === 'component-result' || part.type === 'component-reference'
				) ||
				( message?.metadata && Object.hasOwn( message.metadata, 'componentFallback' ) )
		)
	) {
		projected.text = HISTORY_TEXT;
	}
	return projected;
}
