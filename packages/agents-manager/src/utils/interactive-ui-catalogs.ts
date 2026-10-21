import type { LoadedProviders } from './load-external-providers';
import type { InteractiveUiCatalog } from '@automattic/ai-ui-renderer';

export type InteractiveUiRenderer = typeof import( '@automattic/ai-ui-renderer' );

/** The ID of the catalog with Agents Manager's and its providers' own components. */
export const AGENTS_MANAGER_CATALOG_ID = 'urn:automattic:agents-manager:interactive-ui:v1';

// The first registration of a name wins, as with abilities: the basic names, then each provider's
// in registration order. A later one is skipped, so it can't replace what already works.
function withoutTakenNames< Item extends { name: string } >(
	items: Item[] = [],
	basicNames: Iterable< string >,
	kind: 'component' | 'function'
) {
	const takenNames = new Set( basicNames );

	return items.filter( ( { name } ) => {
		if ( takenNames.has( name ) ) {
			// eslint-disable-next-line no-console
			console.error( `[AgentsManager] Skipped a duplicate interactive UI ${ kind }: ${ name }` );
			return false;
		}

		takenNames.add( name );
		return true;
	} );
}

/**
 * Builds the catalogs a conversation's surfaces render with: A2UI's Basic catalog, for surfaces
 * the agent composes, and Agents Manager's, which adds its providers' components and functions.
 * A provider's mistake can't break the chat: a duplicate name is skipped, and anything else that
 * fails leaves only the basic components in Agents Manager's catalog.
 */
export function createInteractiveUiCatalogs(
	renderer: InteractiveUiRenderer,
	interactiveUi: LoadedProviders[ 'interactiveUi' ]
): InteractiveUiCatalog[] {
	const basicCatalog = renderer.createInteractiveUiCatalog();
	const components = withoutTakenNames(
		interactiveUi?.components,
		basicCatalog.components.keys(),
		'component'
	);
	const functions = withoutTakenNames(
		interactiveUi?.functions,
		basicCatalog.functions.keys(),
		'function'
	);

	try {
		return [
			basicCatalog,
			renderer.createInteractiveUiCatalog( {
				id: AGENTS_MANAGER_CATALOG_ID,
				components,
				functions,
			} ),
		];
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error(
			'[AgentsManager] Failed to add the interactive UI components and functions:',
			error
		);

		return [
			basicCatalog,
			renderer.createInteractiveUiCatalog( { id: AGENTS_MANAGER_CATALOG_ID } ),
		];
	}
}
