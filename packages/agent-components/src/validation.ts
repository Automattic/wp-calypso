import { bindingPath, readBinding } from './bindings';
import { componentDefinitions } from './catalog';
import {
	boundedJson,
	expiry,
	identifier,
	keys,
	limits,
	locale,
	record,
	safeKey,
	string,
	text,
} from './validation-utils';
import type { BindingRequirement } from './catalog';
import type {
	ActionEvent,
	ComponentActionRequest,
	ComponentActionResponse,
	ComponentNode,
	ComponentOpening,
	ComponentResult,
	DataModel,
	JsonValue,
	Surface,
} from './types';

function validateData( value: unknown ): value is DataModel {
	let nodes = 0;
	function visit( item: unknown, depth: number ): boolean {
		if ( ++nodes > limits.dataNodes || depth > limits.depth ) {
			return false;
		}
		if ( item === null || typeof item === 'boolean' ) {
			return true;
		}
		if ( typeof item === 'number' ) {
			return (
				Number.isFinite( item ) && ( ! Number.isInteger( item ) || Number.isSafeInteger( item ) )
			);
		}
		if ( typeof item === 'string' ) {
			return string( item );
		}
		if ( Array.isArray( item ) ) {
			return Array.from( item ).every( ( child ) => visit( child, depth + 1 ) );
		}
		return (
			record( item ) &&
			Object.keys( item ).every(
				( key ) => safeKey( key ) && key.length <= 64 && visit( item[ key ], depth + 1 )
			)
		);
	}
	return record( value ) && visit( value, 0 );
}

function bindingValue( value: unknown, binding: BindingRequirement ): boolean {
	switch ( binding.kind ) {
		case 'scalar':
			return (
				value === null ||
				typeof value === 'string' ||
				typeof value === 'number' ||
				typeof value === 'boolean'
			);
		case 'string':
			return string( value );
		case 'single':
			return typeof value === 'string' && !! binding.options?.includes( value );
		case 'multiple':
			return (
				Array.isArray( value ) &&
				new Set( value ).size === value.length &&
				Array.from( value ).every(
					( option ) => typeof option === 'string' && binding.options?.includes( option )
				)
			);
	}
}

function surfaceBindings( surface: Surface ): BindingRequirement[] {
	return Object.values( surface.components ).flatMap( ( component ) =>
		componentDefinitions[ component.type ].bindings( component )
	);
}

export function validateSurface( value: unknown ): Surface | null {
	if (
		! boundedJson( value ) ||
		! record( value ) ||
		! keys( value, [ 'protocol', 'rootId', 'components', 'data' ] ) ||
		value.protocol !== 'minimal-ai-ui/0.1' ||
		! identifier( value.rootId ) ||
		! record( value.components ) ||
		! validateData( value.data )
	) {
		return null;
	}
	const components = value.components;
	const data = value.data;
	const ids = Object.keys( components );
	if ( ids.length === 0 || ids.length > limits.components ) {
		return null;
	}
	for ( const id of ids ) {
		const component = components[ id ];
		if (
			! identifier( id ) ||
			! record( component ) ||
			component.id !== id ||
			typeof component.type !== 'string' ||
			! Object.hasOwn( componentDefinitions, component.type ) ||
			! componentDefinitions[ component.type ].validate( component )
		) {
			return null;
		}
	}
	const root = components[ value.rootId ];
	if ( ! record( root ) || root.type !== 'Column' ) {
		return null;
	}
	const visited = new Set< string >();
	const bindings: BindingRequirement[] = [];
	function visit( id: string, depth: number ): boolean {
		if ( visited.has( id ) || ! Object.hasOwn( components, id ) || depth > limits.depth ) {
			return false;
		}
		visited.add( id );
		const component = components[ id ] as ComponentNode;
		const definition = componentDefinitions[ component.type ];
		bindings.push( ...definition.bindings( component ) );
		return definition.children( component ).every( ( child ) => visit( child, depth + 1 ) );
	}
	if ( ! visit( value.rootId, 0 ) || visited.size !== ids.length ) {
		return null;
	}
	const editable = new Map< string, BindingRequirement >();
	for ( const binding of bindings ) {
		if (
			! bindingPath( binding.path ) ||
			! bindingValue( readBinding( data, binding.path ), binding )
		) {
			return null;
		}
		if ( binding.editable ) {
			const previous = editable.get( binding.path );
			if (
				previous &&
				( previous.kind !== binding.kind ||
					previous.disabled !== binding.disabled ||
					JSON.stringify( previous.options?.slice().sort() ) !==
						JSON.stringify( binding.options?.slice().sort() ) )
			) {
				return null;
			}
			editable.set( binding.path, binding );
		}
	}
	const visible = new Set( bindings.map( ( binding ) => binding.path ) );
	function visibleData( item: JsonValue, path: string ): boolean {
		if ( visible.has( path ) ) {
			return true;
		}
		return (
			record( item ) &&
			Object.keys( item ).length > 0 &&
			Object.keys( item ).every( ( key ) =>
				visibleData( item[ key ] as JsonValue, `${ path }/${ key }` )
			)
		);
	}
	if ( ! Object.keys( data ).every( ( key ) => visibleData( data[ key ], `/${ key }` ) ) ) {
		return null;
	}
	return value as unknown as Surface;
}

export function validateComponentResult( value: unknown ): ComponentResult | null {
	if (
		! boundedJson( value ) ||
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
		! identifier( value.component ) ||
		! identifier( value.instanceId ) ||
		! text( value.summary ) ||
		! Number.isSafeInteger( value.revision ) ||
		Number( value.revision ) < 1 ||
		( value.status !== 'awaiting-input' && value.status !== 'completed' )
	) {
		return null;
	}
	const surface = validateSurface( value.surface );
	if ( ! surface ) {
		return null;
	}
	if (
		value.status === 'completed' &&
		Object.values( surface.components ).some(
			( component ) =>
				( component.type === 'Button' && ! component.disabled && ! component.loading ) ||
				( ( component.type === 'TextField' || component.type === 'ChoicePicker' ) &&
					! component.disabled )
		)
	) {
		return null;
	}
	return value as unknown as ComponentResult;
}

export function validateLegacyButtonAction( value: unknown ): ComponentResult | null {
	const result = validateComponentResult( value );
	if (
		! result ||
		result.component !== 'button-action' ||
		Object.keys( result.surface.data ).length > 0
	) {
		return null;
	}
	let buttons = 0;
	for ( const component of Object.values( result.surface.components ) ) {
		if ( component.type === 'Button' ) {
			if ( Object.hasOwn( component, 'disabled' ) || Object.hasOwn( component, 'loading' ) ) {
				return null;
			}
			buttons++;
		} else if (
			component.type !== 'Column' &&
			( component.type !== 'Text' || ! ( 'text' in component.content ) )
		) {
			return null;
		}
	}
	return ( result.status === 'awaiting-input' && result.revision === 1 && buttons === 1 ) ||
		( result.status === 'completed' && result.revision === 2 && buttons === 0 )
		? result
		: null;
}

function eligibility( result: ComponentResult, actions: unknown, bindings: unknown ): boolean {
	if (
		! Array.isArray( actions ) ||
		actions.length > limits.components ||
		! Array.from( actions ).every( ( action ) => identifier( action ) ) ||
		new Set( actions ).size !== actions.length ||
		! record( bindings ) ||
		Object.keys( bindings ).length !== actions.length ||
		! Object.keys( bindings ).every( ( action ) => actions.includes( action ) )
	) {
		return false;
	}
	if ( result.status === 'completed' ) {
		return actions.length === 0;
	}
	const fields = surfaceBindings( result.surface ).filter(
		( binding ) => binding.editable && ! binding.disabled
	);
	return actions.every( ( action ) => {
		const paths = bindings[ action ];
		return (
			Object.values( result.surface.components ).some(
				( component ) =>
					component.type === 'Button' &&
					component.action === action &&
					! component.disabled &&
					! component.loading
			) &&
			Array.isArray( paths ) &&
			paths.length <= limits.components &&
			new Set( paths ).size === paths.length &&
			Array.from( paths ).every(
				( path ) => bindingPath( path ) && fields.some( ( field ) => field.path === path )
			)
		);
	} );
}

export function validateComponentOpening( value: unknown ): ComponentOpening | null {
	if (
		! boundedJson( value ) ||
		! record( value ) ||
		! keys( value, [ 'protocol', 'result', 'allowedActions', 'actionBindings', 'expiresAt' ] ) ||
		value.protocol !== 'agent-component/0.1' ||
		! expiry( value.expiresAt )
	) {
		return null;
	}
	const result = validateComponentResult( value.result );
	return result && eligibility( result, value.allowedActions, value.actionBindings )
		? ( value as unknown as ComponentOpening )
		: null;
}

export function validateActionEvent(
	value: unknown,
	surface: Surface,
	allowedActions: ReadonlySet< string >,
	actionBindings: Readonly< Record< string, readonly string[] > >
): ActionEvent | null {
	if (
		! boundedJson( value ) ||
		! record( value ) ||
		! keys( value, [ 'name', 'values' ] ) ||
		! identifier( value.name ) ||
		! allowedActions.has( value.name ) ||
		! record( value.values ) ||
		! Object.hasOwn( actionBindings, value.name )
	) {
		return null;
	}
	const paths = actionBindings[ value.name ];
	const submitted = value.values;
	if (
		Object.keys( submitted ).length !== paths.length ||
		! Object.keys( submitted ).every( ( path ) => paths.includes( path ) )
	) {
		return null;
	}
	const fields = surfaceBindings( surface ).filter(
		( binding ) => binding.editable && ! binding.disabled
	);
	if (
		! paths.every(
			( path ) =>
				Object.hasOwn( submitted, path ) &&
				fields.some( ( field ) => field.path === path && bindingValue( submitted[ path ], field ) )
		)
	) {
		return null;
	}
	return JSON.parse( JSON.stringify( value ) );
}

export function validateActionResponse(
	value: unknown,
	request: ComponentActionRequest,
	opening: ComponentResult
): ComponentActionResponse | null {
	if (
		! boundedJson( value ) ||
		! record( value ) ||
		! keys( value, [ 'protocol', 'requestId', 'outcome', 'current' ] ) ||
		value.protocol !== 'agent-component/0.1' ||
		value.requestId !== request.requestId ||
		typeof value.outcome !== 'string' ||
		! [
			'applied',
			'failed',
			'invalid-input',
			'stale',
			'request-conflict',
			'rejected',
			'indeterminate',
		].includes( value.outcome ) ||
		! record( value.current )
	) {
		return null;
	}
	const current = value.current;
	if (
		current.protocol !== 'agent-component/0.1' ||
		! locale( current.resolvedLocale ) ||
		current.instanceId !== opening.instanceId ||
		current.instanceId !== request.instanceId ||
		! record( current.request ) ||
		current.request.requestId !== request.requestId ||
		! Array.isArray( current.allowedActions )
	) {
		return null;
	}
	const receipt = current.request;
	if ( receipt.state === 'settled' ) {
		if (
			! keys( receipt, [ 'state', 'requestId', 'outcome', 'revision' ] ) ||
			typeof receipt.outcome !== 'string' ||
			! [ 'applied', 'failed', 'invalid-input', 'rejected' ].includes( receipt.outcome ) ||
			! Number.isSafeInteger( receipt.revision ) ||
			Number( receipt.revision ) < 1
		) {
			return null;
		}
	} else if ( receipt.state !== 'unknown' || ! keys( receipt, [ 'state', 'requestId' ] ) ) {
		return null;
	}
	if ( current.state === 'completed' || current.state === 'awaiting-input' ) {
		const awaiting = current.state === 'awaiting-input';
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
				...( awaiting ? [ 'actionBindings' ] : [] ),
			] ) ||
			! expiry( current.expiresAt ) ||
			current.revision !== opening.revision + 1 ||
			current.revision !== request.expectedRevision + 1 ||
			receipt.state !== 'settled' ||
			receipt.revision !== current.revision ||
			receipt.outcome !== value.outcome ||
			( awaiting
				? ! [ 'applied', 'failed', 'invalid-input' ].includes( value.outcome )
				: ! [ 'applied', 'failed' ].includes( value.outcome ) )
		) {
			return null;
		}
		const result = validateComponentResult( current.result );
		if (
			! result ||
			result.status !== current.state ||
			result.instanceId !== current.instanceId ||
			result.revision !== current.revision ||
			result.component !== opening.component ||
			! eligibility( result, current.allowedActions, awaiting ? current.actionBindings : {} )
		) {
			return null;
		}
	} else {
		if (
			! keys( current, [
				'protocol',
				'resolvedLocale',
				'request',
				'state',
				'reason',
				'instanceId',
				'allowedActions',
				'summary',
			] ) ||
			current.allowedActions.length !== 0 ||
			! text( current.summary ) ||
			[ 'applied', 'failed', 'invalid-input' ].includes( value.outcome )
		) {
			return null;
		}
		const reasons: Record< string, readonly string[] > = {
			expired: [ 'INSTANCE_EXPIRED' ],
			'not-found': [ 'INSTANCE_UNAVAILABLE' ],
			'temporarily-unavailable': [
				'STATE_UNAVAILABLE',
				'ROLLOUT_DISABLED',
				'INVALID_STORED_RESULT',
				'DISCLOSURE_DENIED',
			],
		};
		const validReason =
			typeof current.state === 'string' &&
			Object.hasOwn( reasons, current.state ) &&
			typeof current.reason === 'string' &&
			reasons[ current.state ].includes( current.reason );
		if ( ! validReason ) {
			return null;
		}
	}
	return value as unknown as ComponentActionResponse;
}
