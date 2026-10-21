import * as renderer from '@automattic/ai-ui-renderer';
import { AGENTS_MANAGER_CATALOG_ID, createInteractiveUiCatalogs } from '../interactive-ui-catalogs';
import type { InteractiveUiComponentDefinition } from '@automattic/ai-ui-renderer';

function createComponent( name: string ): InteractiveUiComponentDefinition {
	return { name, schema: jest.fn( ( { z } ) => z.object( {} ) ), component: () => null };
}

afterEach( () => jest.restoreAllMocks() );

it( 'adds the providers’ components to Agents Manager’s catalog, next to the Basic catalog', () => {
	const [ basicCatalog, agentsManagerCatalog ] = createInteractiveUiCatalogs( renderer, {
		components: [ createComponent( 'JetpackAiTitlePicker' ) ],
	} );

	expect( basicCatalog.components.has( 'JetpackAiTitlePicker' ) ).toBe( false );
	expect( agentsManagerCatalog.id ).toBe( AGENTS_MANAGER_CATALOG_ID );
	expect( agentsManagerCatalog.components.has( 'JetpackAiTitlePicker' ) ).toBe( true );
} );

it( 'keeps the first of a duplicate name and skips the rest, basic names included', () => {
	const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	const first = createComponent( 'JetpackAiTitlePicker' );
	const duplicate = createComponent( 'JetpackAiTitlePicker' );
	const basicDuplicate = createComponent( 'Text' );

	const [ , agentsManagerCatalog ] = createInteractiveUiCatalogs( renderer, {
		components: [ first, duplicate, basicDuplicate, createComponent( 'WooAiProductCard' ) ],
	} );

	expect( first.schema ).toHaveBeenCalled();
	expect( duplicate.schema ).not.toHaveBeenCalled();
	expect( basicDuplicate.schema ).not.toHaveBeenCalled();
	expect( agentsManagerCatalog.components.has( 'WooAiProductCard' ) ).toBe( true );
	expect( consoleError.mock.calls ).toEqual( [
		[ '[AgentsManager] Skipped a duplicate interactive UI component: JetpackAiTitlePicker' ],
		[ '[AgentsManager] Skipped a duplicate interactive UI component: Text' ],
	] );
} );

it( 'logs a failing definition and keeps only the basic components in Agents Manager’s catalog', () => {
	const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	const broken: InteractiveUiComponentDefinition = {
		...createComponent( 'JetpackAiTitlePicker' ),
		schema: () => {
			throw new Error( 'Broken schema' );
		},
	};

	const [ , agentsManagerCatalog ] = createInteractiveUiCatalogs( renderer, {
		components: [ broken, createComponent( 'WooAiProductCard' ) ],
	} );

	expect( consoleError ).toHaveBeenCalledWith(
		'[AgentsManager] Failed to add the interactive UI components and functions:',
		expect.any( Error )
	);
	expect( agentsManagerCatalog.id ).toBe( AGENTS_MANAGER_CATALOG_ID );
	expect( agentsManagerCatalog.components.has( 'WooAiProductCard' ) ).toBe( false );
	expect( agentsManagerCatalog.components.has( 'Text' ) ).toBe( true );
} );
