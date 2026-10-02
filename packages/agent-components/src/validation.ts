import type { ComponentActionRequest, ComponentResult, Surface } from './types';

function record( value: unknown ): value is Record< string, unknown > {
	return (
		value !== null &&
		typeof value === 'object' &&
		! Array.isArray( value ) &&
		( Object.getPrototypeOf( value ) === Object.prototype ||
			Object.getPrototypeOf( value ) === null )
	);
}

function keys( value: Record< string, unknown >, required: string[], optional: string[] = [] ) {
	return (
		required.every( ( key ) => Object.hasOwn( value, key ) ) &&
		Object.keys( value ).every( ( key ) => required.includes( key ) || optional.includes( key ) )
	);
}

function text( value: unknown ): value is string {
	return typeof value === 'string' && value.length > 0 && value.length <= 8192;
}

function identifier( value: unknown ): value is string {
	return (
		text( value ) &&
		value.length <= 64 &&
		/^[a-zA-Z0-9_.:-]+$/.test( value ) &&
		! [ '__proto__', 'constructor', 'prototype' ].includes( value )
	);
}

function validateSurface( value: unknown ): value is Surface {
	if (
		! record( value ) ||
		! keys( value, [ 'protocol', 'rootId', 'components', 'data' ] ) ||
		value.protocol !== 'minimal-ai-ui/0.1' ||
		! identifier( value.rootId ) ||
		! record( value.components ) ||
		! record( value.data ) ||
		Object.keys( value.data ).length !== 0
	) {
		return false;
	}
	const components = value.components;
	const ids = Object.keys( components );
	if ( ids.length === 0 || ids.length > 64 ) {
		return false;
	}
	for ( const id of ids ) {
		const component = components[ id ];
		if ( ! identifier( id ) || ! record( component ) || component.id !== id ) {
			return false;
		}
		switch ( component.type ) {
			case 'Column':
				if (
					! keys( component, [ 'id', 'type', 'children' ] ) ||
					! Array.isArray( component.children ) ||
					component.children.length > 64 ||
					! component.children.every( identifier )
				) {
					return false;
				}
				break;
			case 'Text':
				if (
					! keys( component, [ 'id', 'type', 'content', 'variant' ], [ 'tone' ] ) ||
					! record( component.content ) ||
					! keys( component.content, [ 'text' ] ) ||
					typeof component.content.text !== 'string' ||
					component.content.text.length > 8192
				) {
					return false;
				}
				if ( component.variant === 'status' ) {
					if (
						typeof component.tone !== 'string' ||
						! [ 'neutral', 'success', 'warning', 'error' ].includes( component.tone )
					) {
						return false;
					}
				} else if (
					typeof component.variant !== 'string' ||
					! [ 'heading', 'body', 'caption' ].includes( component.variant ) ||
					Object.hasOwn( component, 'tone' )
				) {
					return false;
				}
				break;
			case 'Button':
				if (
					! keys( component, [ 'id', 'type', 'label', 'action', 'variant' ] ) ||
					! text( component.label ) ||
					component.label.length > 120 ||
					! identifier( component.action ) ||
					typeof component.variant !== 'string' ||
					! [ 'primary', 'secondary', 'link' ].includes( component.variant )
				) {
					return false;
				}
				break;
			default:
				return false;
		}
	}
	const root = components[ value.rootId ];
	if ( ! record( root ) || root.type !== 'Column' ) {
		return false;
	}
	const visited = new Set< string >();
	function visit( id: string, depth: number ): boolean {
		if ( visited.has( id ) || ! Object.hasOwn( components, id ) || depth > 16 ) {
			return false;
		}
		visited.add( id );
		const component = components[ id ];
		return (
			! record( component ) ||
			component.type !== 'Column' ||
			( Array.isArray( component.children ) &&
				component.children.every( ( child ) => visit( child, depth + 1 ) ) )
		);
	}
	return visit( value.rootId, 0 ) && visited.size === ids.length;
}

export function validateComponentResult( value: unknown ): ComponentResult | null {
	if (
		! record( value ) ||
		! keys( value, [
			'protocol',
			'component',
			'instanceId',
			'revision',
			'status',
			'summary',
			'surface',
		] ) ||
		value.protocol !== 'agent-component/0.1' ||
		value.component !== 'button-action' ||
		! identifier( value.instanceId ) ||
		! text( value.summary ) ||
		! validateSurface( value.surface )
	) {
		return null;
	}
	const buttons = Object.values( value.surface.components ).filter(
		( component ) => component.type === 'Button'
	);
	if ( ! (
		( value.status === 'awaiting-input' && value.revision === 1 && buttons.length === 1 ) ||
		( value.status === 'completed' && value.revision === 2 && buttons.length === 0 )
	) ) {
		return null;
	}
	return value as unknown as ComponentResult;
}

export function validateAppliedResponse(
	value: unknown,
	request: ComponentActionRequest,
	opening: ComponentResult
): { result: ComponentResult; expiresAt: string } | null {
	if (
		! record( value ) ||
		! keys( value, [ 'protocol', 'requestId', 'outcome', 'current' ] ) ||
		value.protocol !== 'agent-component/0.1' ||
		value.requestId !== request.requestId ||
		value.outcome !== 'applied' ||
		! record( value.current )
	) {
		return null;
	}
	const current = value.current;
	if (
		! keys( current, [
			'protocol',
			'resolvedLocale',
			'request',
			'state',
			'instanceId',
			'allowedActions',
			'revision',
			'result',
			'expiresAt',
		] ) ||
		current.protocol !== 'agent-component/0.1' ||
		! text( current.resolvedLocale ) ||
		current.state !== 'completed' ||
		current.instanceId !== opening.instanceId ||
		current.instanceId !== request.instanceId ||
		current.revision !== opening.revision + 1 ||
		current.revision !== request.expectedRevision + 1 ||
		! Array.isArray( current.allowedActions ) ||
		current.allowedActions.length !== 0 ||
		! record( current.request ) ||
		! keys( current.request, [ 'state', 'requestId', 'outcome', 'revision' ] ) ||
		current.request.state !== 'settled' ||
		current.request.requestId !== request.requestId ||
		current.request.outcome !== 'applied' ||
		current.request.revision !== current.revision ||
		typeof current.expiresAt !== 'string' ||
		! /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
			current.expiresAt
		) ||
		! Number.isFinite( Date.parse( current.expiresAt ) )
	) {
		return null;
	}
	const result = validateComponentResult( current.result );
	return result?.status === 'completed' &&
		result.instanceId === current.instanceId &&
		result.revision === current.revision &&
		result.component === opening.component
		? { result, expiresAt: current.expiresAt }
		: null;
}

export function actionFailureMessage(
	value: unknown,
	request: ComponentActionRequest
): string | null {
	if (
		record( value ) &&
		keys( value, [ 'protocol', 'requestId', 'outcome', 'current' ] ) &&
		value.protocol === 'agent-component/0.1' &&
		value.requestId === request.requestId &&
		typeof value.outcome === 'string' &&
		[ 'rejected', 'stale', 'indeterminate' ].includes( value.outcome ) &&
		record( value.current )
	) {
		const current = value.current;
		if (
			keys( current, [
				'protocol',
				'resolvedLocale',
				'request',
				'state',
				'reason',
				'instanceId',
				'allowedActions',
				'summary',
			] ) &&
			current.protocol === 'agent-component/0.1' &&
			text( current.resolvedLocale ) &&
			current.instanceId === request.instanceId &&
			Array.isArray( current.allowedActions ) &&
			current.allowedActions.length === 0 &&
			record( current.request ) &&
			keys( current.request, [ 'state', 'requestId' ] ) &&
			current.request.state === 'unknown' &&
			current.request.requestId === request.requestId &&
			text( current.summary ) &&
			( ( value.outcome === 'indeterminate' &&
				current.state === 'temporarily-unavailable' &&
				current.reason === 'STATE_UNAVAILABLE' ) ||
				( value.outcome !== 'indeterminate' &&
					current.state === 'not-found' &&
					current.reason === 'INSTANCE_UNAVAILABLE' ) )
		) {
			return current.summary;
		}
	}
	return null;
}
