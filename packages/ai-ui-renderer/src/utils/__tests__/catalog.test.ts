import { BASIC_CATALOG_ID, createInteractiveUiCatalog } from '../catalog';
import type {
	InteractiveUiComponentDefinition,
	InteractiveUiFunctionDefinition,
} from '../definitions';

function createHostComponent( name: string ): InteractiveUiComponentDefinition {
	return { name, schema: ( { z } ) => z.object( {} ), component: () => null };
}

const hostFunction: InteractiveUiFunctionDefinition = {
	name: 'hostOpenHelpCenter',
	returnType: 'void',
	schema: ( { z } ) => z.object( {} ),
	execute: jest.fn(),
};

it( 'adds the host components and functions to the basic ones and A2UI’s built-in functions', () => {
	const catalog = createInteractiveUiCatalog( {
		id: 'urn:host:catalog:v1',
		components: [ createHostComponent( 'HostColorPicker' ) ],
		functions: [ hostFunction ],
	} );

	expect( catalog.id ).toBe( 'urn:host:catalog:v1' );
	expect( [ ...catalog.components.keys() ] ).toEqual(
		expect.arrayContaining( [ 'Text', 'HostColorPicker' ] )
	);

	expect( [ ...catalog.functions.keys() ] ).toEqual(
		expect.arrayContaining( [ 'formatString', 'hostOpenHelpCenter' ] )
	);
} );

it( 'uses the Basic catalog ID by default', () => {
	expect( createInteractiveUiCatalog().id ).toBe( BASIC_CATALOG_ID );
} );

it.each( [
	{
		kind: 'component',
		name: 'Text',
		options: { components: [ createHostComponent( 'Text' ) ] },
	},
	{
		kind: 'function',
		name: 'formatString',
		options: { functions: [ { ...hostFunction, name: 'formatString' } ] },
	},
] )( 'rejects a $kind named like an existing one', ( { kind, name, options } ) => {
	expect( () => createInteractiveUiCatalog( options ) ).toThrow(
		`Duplicate interactive UI ${ kind } name: ${ name }`
	);
} );
