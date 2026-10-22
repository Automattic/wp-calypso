import { BASIC_CATALOG_ID } from '../../capabilities';
import { createInteractiveUiCatalog } from '../catalog';
import type { InteractiveUiCatalogDefinition } from '../definitions';

const hostCatalog: InteractiveUiCatalogDefinition = {
	catalog: {
		catalogId: 'urn:host:catalog:v1',
		instructions: 'Use HostColorPicker to pick a color.',
		components: {
			HostColorPicker: { type: 'object', properties: {}, allowedParents: [ 'Column' ] },
		},
		functions: {
			hostOpenHelpCenter: {
				type: 'object',
				returnType: 'void',
				properties: { '@call': { const: 'hostOpenHelpCenter' } },
			},
		},
	},
	components: { HostColorPicker: () => null },
	functions: { hostOpenHelpCenter: jest.fn() },
};

it( 'builds A2UI’s Basic catalog by default', () => {
	const catalog = createInteractiveUiCatalog();

	expect( catalog.id ).toBe( BASIC_CATALOG_ID );
	expect( catalog.components.has( 'Text' ) ).toBe( true );
	expect( catalog.functions.has( 'formatString' ) ).toBe( true );
} );

it( 'adds a catalog’s own components and functions to the basic ones', () => {
	const catalog = createInteractiveUiCatalog( hostCatalog );

	expect( catalog.id ).toBe( 'urn:host:catalog:v1' );
	expect( catalog.instructions ).toBe( 'Use HostColorPicker to pick a color.' );
	expect( [ ...catalog.components.keys() ] ).toEqual(
		expect.arrayContaining( [ 'Text', 'HostColorPicker' ] )
	);
	expect( catalog.components.get( 'HostColorPicker' )?.allowedParents ).toEqual( [ 'Column' ] );
	expect( [ ...catalog.functions.keys() ] ).toEqual(
		expect.arrayContaining( [ 'formatString', 'hostOpenHelpCenter' ] )
	);
} );

it.each< { problem: string; definition: InteractiveUiCatalogDefinition; error: string } >( [
	{
		problem: 'a component without an implementation',
		definition: { ...hostCatalog, components: {} },
		error: 'The interactive UI component HostColorPicker has no implementation.',
	},
	{
		problem: 'a function missing from the document',
		definition: { ...hostCatalog, functions: { ...hostCatalog.functions, hostExtra: jest.fn() } },
		error: "The interactive UI function hostExtra isn't in its catalog document.",
	},
	{
		problem: 'a basic component’s name',
		definition: {
			catalog: { catalogId: 'urn:host:catalog:v1', components: { Text: { type: 'object' } } },
			components: { Text: () => null },
		},
		error: 'The interactive UI component Text is already a basic one.',
	},
] )( 'rejects $problem', ( { definition, error } ) => {
	expect( () => createInteractiveUiCatalog( definition ) ).toThrow( error );
} );
