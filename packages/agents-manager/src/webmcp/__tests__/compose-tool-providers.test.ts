import { mergeToolProviders } from '../compose-tool-providers';
import type { Ability } from '../../abilities/types';
import type { ToolProvider } from '../../extension-types';

const createAbility = ( name: string, label = name ): Ability => ( {
	name,
	label,
	description: `Description for ${ name }`,
	category: 'demo',
	input_schema: { type: 'object', properties: {} },
} );

const createProvider = ( abilities: Ability[], result: unknown = { ok: true } ): ToolProvider => ( {
	getAbilities: jest.fn( async () => abilities ),
	executeAbility: jest.fn( async () => result ),
} );

describe( 'mergeToolProviders', () => {
	it( 'lets the first provider that lists an ability define it', async () => {
		const first = createProvider( [ createAbility( 'demo/read', 'First copy' ) ] );
		const second = createProvider( [
			createAbility( 'demo/read', 'Second copy' ),
			createAbility( 'demo/write' ),
		] );

		const abilities = await mergeToolProviders( () => [ first, second ], jest.fn() ).getAbilities();

		expect( abilities.map( ( ability ) => `${ ability.name }:${ ability.label }` ) ).toEqual( [
			'demo/read:First copy',
			'demo/write:demo/write',
		] );
	} );

	it( 'executes through the first provider that lists the ability, by either name form', async () => {
		const first = createProvider( [ createAbility( 'demo/read' ) ], { from: 'first' } );
		const second = createProvider(
			[ createAbility( 'demo/read' ), createAbility( 'demo/write' ) ],
			{ from: 'second' }
		);
		const merged = mergeToolProviders( () => [ first, second ], jest.fn() );

		await expect( merged.executeAbility( 'demo/read', {} ) ).resolves.toEqual( { from: 'first' } );
		await expect( merged.executeAbility( 'demo__write', { a: 1 } ) ).resolves.toEqual( {
			from: 'second',
		} );
		expect( first.executeAbility ).toHaveBeenCalledTimes( 1 );
		expect( second.executeAbility ).toHaveBeenCalledWith( 'demo__write', { a: 1 } );
	} );

	it( 'resolves the providers and the owner live on every call', async () => {
		const first = createProvider( [] );
		const second = createProvider( [ createAbility( 'demo/read' ) ] );
		let providers = [ second ];
		const merged = mergeToolProviders( () => providers, jest.fn() );

		await merged.executeAbility( 'demo/read', {} );
		expect( second.executeAbility ).toHaveBeenCalledTimes( 1 );

		providers = [ first, second ];
		jest.mocked( first.getAbilities ).mockResolvedValue( [ createAbility( 'demo/read' ) ] );
		await merged.executeAbility( 'demo/read', {} );
		expect( first.executeAbility ).toHaveBeenCalledTimes( 1 );
		expect( second.executeAbility ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'reports a failed source and keeps serving the others', async () => {
		const first = createProvider( [] );
		const error = new Error( 'Unavailable' );
		jest.mocked( first.getAbilities ).mockRejectedValue( error );
		const second = createProvider( [ createAbility( 'demo/read' ) ] );
		const onError = jest.fn();
		const merged = mergeToolProviders( () => [ first, second ], onError );

		const abilities = await merged.getAbilities();
		expect( abilities.map( ( ability ) => ability.name ) ).toEqual( [ 'demo/read' ] );
		expect( onError ).toHaveBeenCalledWith( error );
		await expect( merged.executeAbility( 'demo/read', {} ) ).resolves.toEqual( { ok: true } );
		expect( onError ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'rejects an ability no provider lists', async () => {
		const merged = mergeToolProviders( () => [ createProvider( [] ) ], jest.fn() );

		await expect( merged.executeAbility( 'demo/missing', {} ) ).rejects.toThrow( 'demo/missing' );
	} );
} );
