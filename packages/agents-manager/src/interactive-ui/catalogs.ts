import {
	assertInteractiveUiCatalogDefinition,
	BASIC_CATALOG_ID,
	getInteractiveUiRendererCapabilities,
} from '@automattic/ai-ui-renderer/capabilities';
import OpenHelpCenterButton from '../components/open-help-center-button';
import { ButtonPicker, ColorPicker, FontPicker } from '../components/style-pickers';
import { withChatResponseTracking } from './with-chat-response-tracking';
import type {
	InteractiveUiCatalog,
	InteractiveUiCatalogDefinition,
} from '@automattic/ai-ui-renderer';

export type InteractiveUiRenderer = typeof import( '@automattic/ai-ui-renderer' );

/** The ID of Agents Manager's catalog, which its abilities build surfaces with. */
export const AGENTS_MANAGER_CATALOG_ID = 'urn:automattic:agents-manager:interactive-ui:v1';

// Style variations are theme.json partials, passed through to the editor as they are.
const STYLE_VARIATIONS = { type: 'array', items: { type: 'object', additionalProperties: true } };

const AGENTS_MANAGER_CATALOG: InteractiveUiCatalogDefinition = {
	catalog: {
		catalogId: AGENTS_MANAGER_CATALOG_ID,
		components: {
			AgentsManagerColorPicker: {
				type: 'object',
				properties: { variations: STYLE_VARIATIONS },
				required: [ 'variations' ],
			},
			AgentsManagerFontPicker: {
				type: 'object',
				properties: { themeVariations: STYLE_VARIATIONS, dynamicVariations: STYLE_VARIATIONS },
			},
			AgentsManagerButtonPicker: {
				type: 'object',
				properties: {
					buttonVariations: STYLE_VARIATIONS,
					maxButtonsToShow: { type: 'integer' },
				},
				required: [ 'buttonVariations' ],
			},
			AgentsManagerHelpCenterButton: {
				type: 'object',
				properties: { message: { type: 'string' } },
			},
		},
	},
	// Its pickers need style variations that only the color, font and button abilities fill in, and
	// the Help Center button shows only once the support workflow approves a hand-off.
	agentComposable: false,
	components: {
		AgentsManagerColorPicker: ColorPicker,
		AgentsManagerFontPicker: FontPicker,
		AgentsManagerButtonPicker: ButtonPicker,
		AgentsManagerHelpCenterButton: OpenHelpCenterButton,
	},
};

/**
 * Skips a provider catalog that isn't made of object schemas or whose implementations don't match
 * its document, so the chat doesn't advertise it. As with abilities, the first with an ID wins, so
 * a provider can't replace a catalog that already works. The Basic and Agents Manager IDs are
 * taken.
 */
export function filterInteractiveUiCatalogs( catalogs: InteractiveUiCatalogDefinition[] ) {
	const takenIds = new Set( [ BASIC_CATALOG_ID, AGENTS_MANAGER_CATALOG_ID ] );

	return catalogs.filter( ( definition ) => {
		try {
			assertInteractiveUiCatalogDefinition( definition );

			if ( takenIds.has( definition.catalog.catalogId ) ) {
				throw new Error( `The catalog ID ${ definition.catalog.catalogId } is taken.` );
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[AgentsManager] Skipped an interactive UI catalog:', error );
			return false;
		}

		takenIds.add( definition.catalog.catalogId );
		return true;
	} );
}

/** What the chat renders, as A2UI's `a2uiRendererCapabilities`, for each message's metadata. */
export function getInteractiveUiCapabilities(
	providerCatalogs: InteractiveUiCatalogDefinition[] = []
) {
	return getInteractiveUiRendererCapabilities( [ AGENTS_MANAGER_CATALOG, ...providerCatalogs ] );
}

/**
 * Builds the catalogs a conversation's surfaces render with: A2UI's Basic catalog, Agents
 * Manager's, and each provider's, whose components record the shared response events. A catalog
 * that fails to build is skipped, so only its own surfaces don't render.
 */
export function createInteractiveUiCatalogs(
	renderer: InteractiveUiRenderer,
	providerCatalogs: InteractiveUiCatalogDefinition[] = []
): InteractiveUiCatalog[] {
	const catalogs = [ renderer.createInteractiveUiCatalog() ];

	for ( const definition of [ AGENTS_MANAGER_CATALOG, ...providerCatalogs ] ) {
		const components = Object.entries( definition.components ?? {} ).map(
			( [ name, component ] ) => [ name, withChatResponseTracking( name, component ) ]
		);

		try {
			catalogs.push(
				renderer.createInteractiveUiCatalog( {
					...definition,
					components: Object.fromEntries( components ),
				} )
			);
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
