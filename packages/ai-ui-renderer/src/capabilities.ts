import type {
	InteractiveUiCatalogDefinition,
	InteractiveUiCatalogDocument,
} from './utils/definitions';

// This entry has no A2UI or React code, so hosts can use it without loading the renderer.

export { getInteractiveUiOperation } from './utils/operation';

export type InteractiveUiActionMode = 'agent' | 'tool-call';

/** Guidance for the agent composing actions, included in the host's rendering tool description. */
export function getInteractiveUiActionInstructions( mode: InteractiveUiActionMode = 'agent' ) {
	if ( mode === 'tool-call' ) {
		return 'UI event actions call tools directly. Set action.event.name to an available tool name and action.event.context to its complete arguments, using data bindings for editable values. No LLM interprets the action or chooses another tool after a click. Do not use free-form action names or promise an assistant follow-up. The host handles tool results and any UI updates; tool calls may still be visible in the client.';
	}

	return 'UI event actions are sent to the agent for interpretation. Use action.event.name to describe the intent and action.event.context for the values the agent needs.';
}

/** The ID of A2UI's Basic catalog, which the basic components implement. */
export const BASIC_CATALOG_ID = 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json';

// A function component, or one React wraps in an object, such as `memo()`, `forwardRef()` or `lazy()`.
function isComponent( value: unknown ) {
	return (
		typeof value === 'function' ||
		( typeof value === 'object' && value !== null && '$$typeof' in value )
	);
}

// Every implementation needs a name in the document, and every name a real implementation.
function assertImplementations(
	kind: 'component' | 'function',
	documentNames: string[],
	implementations: Record< string, unknown >,
	isImplementation: ( value: unknown ) => boolean
) {
	const extraName = Object.keys( implementations ).find(
		( name ) => ! documentNames.includes( name )
	);

	if ( extraName ) {
		throw new Error( `The interactive UI ${ kind } ${ extraName } isn't in its catalog document.` );
	}

	const missingName = documentNames.find(
		( name ) => ! isImplementation( implementations[ name ] )
	);

	if ( missingName ) {
		throw new Error( `The interactive UI ${ kind } ${ missingName } has no implementation.` );
	}
}

interface ObjectSchema {
	properties?: Record< string, unknown >;
	required?: string[];
	requiresUserActivation?: boolean;
}

function isObject( value: unknown ): value is Record< string, unknown > {
	return typeof value === 'object' && value !== null && ! Array.isArray( value );
}

// A2UI describes each component and function as a JSON Schema object.
function assertSchemas( kind: 'component' | 'function', definitions: Record< string, unknown > ) {
	for ( const [ name, schema ] of Object.entries( definitions ) ) {
		if (
			! isObject( schema ) ||
			( 'type' in schema && schema.type !== 'object' ) ||
			( 'properties' in schema && ! isObject( schema.properties ) ) ||
			( 'required' in schema && ! Array.isArray( schema.required ) )
		) {
			throw new Error( `The interactive UI ${ kind } ${ name } needs an object schema.` );
		}
	}
}

/**
 * Throws when a catalog definition has no ID, a component or function that isn't an object
 * schema, or code that doesn't match its document: each of its components and functions needs an
 * implementation, and nothing else.
 * `createInteractiveUiCatalog()` rejects those, so check catalogs with it before advertising them.
 */
export function assertInteractiveUiCatalogDefinition( {
	catalog,
	components = {},
	functions = {},
}: InteractiveUiCatalogDefinition ) {
	// Definitions often come from other bundles, unchecked by TypeScript.
	if ( typeof catalog?.catalogId !== 'string' || ! catalog.catalogId ) {
		throw new Error( 'An interactive UI catalog needs a `catalogId`.' );
	}

	const { components: componentSchemas = {}, functions: functionSchemas = {} } = catalog;

	assertSchemas( 'component', componentSchemas );
	assertSchemas( 'function', functionSchemas );

	assertImplementations( 'component', Object.keys( componentSchemas ), components, isComponent );
	assertImplementations(
		'function',
		Object.keys( functionSchemas ),
		functions,
		( value ) => typeof value === 'function'
	);
}

function mapDefinitions(
	definitions: Record< string, object >,
	map: ( definition: ObjectSchema, name: string ) => object
) {
	return Object.fromEntries(
		Object.entries( definitions ).map( ( [ name, definition ] ) => [
			name,
			map( definition as ObjectSchema, name ),
		] )
	);
}

// A2UI tells components and functions apart by a required prop whose const is their name.
function withDiscriminator(
	{ properties, required = [], ...schema }: ObjectSchema,
	key: 'component' | '@call',
	name: string
) {
	return {
		type: 'object',
		...schema,
		properties: { ...properties, [ key ]: { const: name } },
		required: [ key, ...required.filter( ( requiredKey ) => requiredKey !== key ) ],
	};
}

// A document in A2UI's form. Each function states `requiresUserActivation`, since A2UI defaults it
// to false but this renderer to true.
function toInlineCatalog( {
	catalogId,
	title,
	description,
	instructions,
	components,
	functions,
}: InteractiveUiCatalogDocument ) {
	return {
		$id: catalogId,
		catalogId,
		protocolVersion: '1.0',
		...( title && { title } ),
		...( description && { description } ),
		...( instructions && { instructions } ),
		...( components && {
			components: mapDefinitions( components, ( definition, name ) =>
				withDiscriminator( definition, 'component', name )
			),
		} ),
		...( functions && {
			functions: mapDefinitions( functions, ( definition, name ) => ( {
				...withDiscriminator( definition, '@call', name ),
				requiresUserActivation: definition.requiresUserActivation ?? true,
			} ) ),
		} ),
	};
}

/**
 * A2UI's `a2uiRendererCapabilities` for a host that renders the Basic catalog and these catalog
 * definitions: their IDs, and, for the agent to compose with, the documents of those that aren't
 * `agentComposable: false`.
 */
export function getInteractiveUiRendererCapabilities(
	catalogs: Array< Pick< InteractiveUiCatalogDefinition, 'catalog' | 'agentComposable' > >
) {
	return {
		'v1.0': {
			supportedCatalogIds: [
				BASIC_CATALOG_ID,
				...catalogs.map( ( { catalog } ) => catalog.catalogId ),
			],
			inlineCatalogs: catalogs
				.filter( ( { agentComposable } ) => agentComposable !== false )
				.map( ( { catalog } ) => toInlineCatalog( catalog ) ),
		},
	};
}
