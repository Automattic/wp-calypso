import { mergeToolProviders } from '../compose-tool-providers';
import type { ToolProvider } from '../../extension-types';
import type { Ability } from '@wordpress/abilities';

const createAbility = ( name: string, label = name ): Ability => ( {
	name,
	label,
	description: `Description for ${ name }`,
	category: 'demo',
	input_schema: { type: 'object', properties: {} },
} );

const createProvider = ( abilities: Ability[] ): ToolProvider => ( {
	getAbilities: jest.fn( async () => abilities ),
	executeAbility: jest.fn(),
} );

describe( 'mergeToolProviders', () => {
	it( 'lets the first provider that lists an ability define it', async () => {
		const first = createProvider( [ createAbility( 'demo/read', 'First copy' ) ] );
		const second = createProvider( [
			createAbility( 'demo/read', 'Second copy' ),
			createAbility( 'demo/write' ),
		] );

		const snapshot = await mergeToolProviders( () => [ first, second ], jest.fn() ).getSnapshot();

		expect(
			[ ...snapshot.values() ].map( ( { ability } ) => `${ ability.name }:${ ability.label }` )
		).toEqual( [ 'demo/read:First copy', 'demo/write:demo/write' ] );
	} );

	it( 'resolves the winning definition and provider by original ability name', async () => {
		const read = createAbility( 'demo/read', 'First copy' );
		const write = createAbility( 'demo/write' );
		const first = createProvider( [ read ] );
		const second = createProvider( [ createAbility( 'demo/read', 'Second copy' ), write ] );
		const merged = mergeToolProviders( () => [ first, second ], jest.fn() );

		expect( ( await merged.getSnapshot() ).get( 'demo/read' ) ).toEqual( {
			ability: read,
			provider: first,
		} );
		expect( ( await merged.getSnapshot() ).get( 'demo/write' ) ).toEqual( {
			ability: write,
			provider: second,
		} );
	} );

	it( 'does not resolve normalized tool names as ability names', async () => {
		const provider = createProvider( [ createAbility( 'demo/read' ) ] );
		const merged = mergeToolProviders( () => [ provider ], jest.fn() );

		expect( ( await merged.getSnapshot() ).get( 'demo__read' ) ).toBeUndefined();
	} );

	it( 'resolves the providers and the owner live on every call', async () => {
		const first = createProvider( [] );
		const second = createProvider( [ createAbility( 'demo/read' ) ] );
		let providers = [ second ];
		const merged = mergeToolProviders( () => providers, jest.fn() );

		const original = ( await merged.getSnapshot() ).get( 'demo/read' );
		expect( original?.provider ).toBe( second );

		providers = [ first, second ];
		jest.mocked( first.getAbilities ).mockResolvedValue( [ createAbility( 'demo/read' ) ] );
		const current = ( await merged.getSnapshot() ).get( 'demo/read' );
		expect( current?.provider ).toBe( first );
		expect( original?.provider ).toBe( second );
	} );

	it( 'reports a failed source and keeps serving the others', async () => {
		const first = createProvider( [] );
		const error = new Error( 'Unavailable' );
		jest.mocked( first.getAbilities ).mockRejectedValue( error );
		const second = createProvider( [ createAbility( 'demo/read' ) ] );
		const onError = jest.fn();
		const merged = mergeToolProviders( () => [ first, second ], onError );

		const snapshot = await merged.getSnapshot();
		expect( [ ...snapshot.keys() ] ).toEqual( [ 'demo/read' ] );
		expect( onError ).toHaveBeenCalledWith( error );
		expect( ( await merged.getSnapshot() ).get( 'demo/read' ) ).toEqual( {
			ability: createAbility( 'demo/read' ),
			provider: second,
		} );
		expect( onError ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'returns no owner for an ability no provider lists', async () => {
		const merged = mergeToolProviders( () => [ createProvider( [] ) ], jest.fn() );

		expect( ( await merged.getSnapshot() ).get( 'demo/missing' ) ).toBeUndefined();
	} );
} );
