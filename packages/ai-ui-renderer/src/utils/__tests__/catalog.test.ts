import { memo } from '@wordpress/element';
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

it( 'accepts a component React wraps, such as a memoized one', () => {
	const catalog = createInteractiveUiCatalog( {
		...hostCatalog,
		components: { HostColorPicker: memo( () => null ) },
	} );

	expect( catalog.components.has( 'HostColorPicker' ) ).toBe( true );
} );

it( 'lets a catalog’s own component replace the basic one of the same name', () => {
	const basicText = createInteractiveUiCatalog().components.get( 'Text' );

	const catalog = createInteractiveUiCatalog( {
		catalog: { catalogId: 'urn:host:catalog:v1', components: { Text: { type: 'object' } } },
		components: { Text: () => null },
	} );

	expect( catalog.components.get( 'Text' ) ).not.toBe( basicText );
} );

it.each< { problem: string; definition: InteractiveUiCatalogDefinition; error: string } >( [
	{
		problem: 'a component whose implementation isn’t a component',
		definition: {
			...hostCatalog,
			components: {
				HostColorPicker: {},
			} as unknown as InteractiveUiCatalogDefinition[ 'components' ],
		},
		error: 'The interactive UI component HostColorPicker has no implementation.',
	},
	{
		problem: 'an invalid component missing from the document',
		definition: {
			...hostCatalog,
			components: {
				...hostCatalog.components,
				HostExtra: undefined,
			} as unknown as InteractiveUiCatalogDefinition[ 'components' ],
		},
		error: "The interactive UI component HostExtra isn't in its catalog document.",
	},
	{
		problem: 'a function whose implementation isn’t a function',
		definition: {
			...hostCatalog,
			functions: {
				hostOpenHelpCenter: undefined,
			} as unknown as InteractiveUiCatalogDefinition[ 'functions' ],
		},
		error: 'The interactive UI function hostOpenHelpCenter has no implementation.',
	},
	{
		problem: 'a catalog with an empty ID',
		definition: { ...hostCatalog, catalog: { ...hostCatalog.catalog, catalogId: '' } },
		error: 'An interactive UI catalog needs a `catalogId`.',
	},
] )( 'rejects $problem', ( { definition, error } ) => {
	expect( () => createInteractiveUiCatalog( definition ) ).toThrow( error );
} );
