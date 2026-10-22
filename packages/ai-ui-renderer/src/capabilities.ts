import type {
	InteractiveUiCatalogDefinition,
	InteractiveUiCatalogDocument,
} from './utils/definitions';

// This entry has no A2UI or React code, so hosts can check and describe their catalogs without
// loading the renderer.

/** The ID of A2UI's Basic catalog, which the basic components implement. */
export const BASIC_CATALOG_ID = 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json';

// A function component, or one React wraps in an object, such as `memo()`, `forwardRef()` or `lazy()`.
function isComponent( value: unknown ) {
	return (
		typeof value === 'function' ||
		( typeof value === 'object' && value !== null && '$$typeof' in value )
	);
}

function assertSameNames(
	kind: 'component' | 'function',
	documentNames: string[],
	implementedNames: string[]
) {
	const missingName = documentNames.find( ( name ) => ! implementedNames.includes( name ) );

	if ( missingName ) {
		throw new Error( `The interactive UI ${ kind } ${ missingName } has no implementation.` );
	}

	const extraName = implementedNames.find( ( name ) => ! documentNames.includes( name ) );

	if ( extraName ) {
		throw new Error( `The interactive UI ${ kind } ${ extraName } isn't in its catalog document.` );
	}
}

/**
 * Throws when a catalog definition has no ID, or its code doesn't match its document: each of its
 * components and functions needs an implementation, and nothing else.
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

	assertSameNames(
		'component',
		Object.keys( catalog.components ?? {} ),
		Object.keys( components ).filter( ( name ) => isComponent( components[ name ] ) )
	);
	assertSameNames(
		'function',
		Object.keys( catalog.functions ?? {} ),
		Object.keys( functions ).filter( ( name ) => typeof functions[ name ] === 'function' )
	);
}

/**
 * A2UI's `a2uiRendererCapabilities` for a host that renders the Basic catalog and these: their IDs,
 * and their documents for the agent.
 */
export function getInteractiveUiRendererCapabilities( catalogs: InteractiveUiCatalogDocument[] ) {
	return {
		'v1.0': {
			supportedCatalogIds: [ BASIC_CATALOG_ID, ...catalogs.map( ( { catalogId } ) => catalogId ) ],
			inlineCatalogs: catalogs.map( ( catalog ) => ( { ...catalog, protocolVersion: '1.0' } ) ),
		},
	};
}
