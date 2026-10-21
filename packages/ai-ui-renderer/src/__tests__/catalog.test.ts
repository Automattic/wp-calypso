import { basicCatalog, createComponentImplementation } from '@a2ui/react/v0_9';
import { z } from 'zod';
import { createInteractiveUiCatalog } from '../catalog';

function createHostComponent( name: string ) {
	return createComponentImplementation( { name, schema: z.object( {} ) }, () => null );
}

const hostFunction = {
	name: 'hostOpenHelpCenter',
	returnType: 'void' as const,
	schema: z.object( {} ),
	execute: jest.fn(),
};

it( 'adds the host components and functions to the basic ones under the Basic catalog ID', () => {
	const HostColorPicker = createHostComponent( 'HostColorPicker' );

	const catalog = createInteractiveUiCatalog( {
		components: [ HostColorPicker ],
		functions: [ hostFunction ],
	} );

	expect( catalog.id ).toBe( basicCatalog.id );
	expect( catalog.components.has( 'Text' ) ).toBe( true );
	expect( catalog.components.get( 'HostColorPicker' ) ).toBe( HostColorPicker );
	expect( catalog.functions.get( 'hostOpenHelpCenter' ) ).toBe( hostFunction );
} );

it.each( [
	{
		kind: 'component',
		name: 'Text',
		options: { components: [ createHostComponent( 'Text' ) ] },
	},
	{
		kind: 'function',
		name: 'hostOpenHelpCenter',
		options: { functions: [ hostFunction, hostFunction ] },
	},
] )( 'rejects a duplicate $kind name', ( { kind, name, options } ) => {
	expect( () => createInteractiveUiCatalog( options ) ).toThrow(
		`Duplicate interactive UI ${ kind } name: ${ name }`
	);
} );
