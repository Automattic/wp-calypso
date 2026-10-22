import type { InteractiveUiCatalogDocument } from './utils/definitions';

// This entry has no A2UI or React code, so hosts can describe what they render without loading
// the renderer.

/** The ID of A2UI's Basic catalog, which the basic components implement. */
export const BASIC_CATALOG_ID = 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json';

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
