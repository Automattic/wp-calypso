import {
	BASIC_CATALOG_ID,
	getInteractiveUiRendererCapabilities,
} from '@automattic/ai-ui-renderer/capabilities';
import type {
	InteractiveUiCatalog,
	InteractiveUiCatalogDefinition,
} from '@automattic/ai-ui-renderer';

export type InteractiveUiRenderer = typeof import( '@automattic/ai-ui-renderer' );

/** The ID of Agents Manager's catalog, which its abilities build surfaces with. */
export const AGENTS_MANAGER_CATALOG_ID = 'urn:automattic:agents-manager:interactive-ui:v1';

// Agents Manager's own components join its catalog as its chat UIs move to interactive UI.
const AGENTS_MANAGER_CATALOG: InteractiveUiCatalogDefinition = {
	catalog: { catalogId: AGENTS_MANAGER_CATALOG_ID },
};

/**
 * Keeps the provider catalogs with an ID of their own. As with abilities, the first with an ID
 * wins, so a provider can't replace a catalog that already works. The Basic and Agents Manager
 * IDs are taken.
 */
export function filterInteractiveUiCatalogs( catalogs: InteractiveUiCatalogDefinition[] ) {
	const takenIds = new Set( [ BASIC_CATALOG_ID, AGENTS_MANAGER_CATALOG_ID ] );

	return catalogs.filter( ( definition ) => {
		// Providers' exports aren't validated, so one can lack its catalog document.
		const catalogId = definition.catalog?.catalogId;

		if ( typeof catalogId !== 'string' || takenIds.has( catalogId ) ) {
			// eslint-disable-next-line no-console
			console.error(
				`[AgentsManager] Skipped an interactive UI catalog without an ID of its own: ${ catalogId }`
			);
			return false;
		}

		takenIds.add( catalogId );
		return true;
	} );
}

/** What the chat renders, as A2UI's `a2uiRendererCapabilities`, for its client context. */
export function getInteractiveUiCapabilities(
	providerCatalogs: InteractiveUiCatalogDefinition[] = []
) {
	return getInteractiveUiRendererCapabilities(
		[ AGENTS_MANAGER_CATALOG, ...providerCatalogs ].map( ( { catalog } ) => catalog )
	);
}

/**
 * Builds the catalogs a conversation's surfaces render with: A2UI's Basic catalog, Agents
 * Manager's, and each provider's. A provider's mistake can't break the chat: a catalog that fails
 * to build is skipped, so only its own surfaces don't render.
 */
export function createInteractiveUiCatalogs(
	renderer: InteractiveUiRenderer,
	providerCatalogs: InteractiveUiCatalogDefinition[] = []
): InteractiveUiCatalog[] {
	const catalogs = [ renderer.createInteractiveUiCatalog() ];

	for ( const definition of [ AGENTS_MANAGER_CATALOG, ...providerCatalogs ] ) {
		try {
			catalogs.push( renderer.createInteractiveUiCatalog( definition ) );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error(
				`[AgentsManager] Failed to build the interactive UI catalog ${ definition.catalog.catalogId }:`,
				error
			);
		}
	}

	return catalogs;
}
