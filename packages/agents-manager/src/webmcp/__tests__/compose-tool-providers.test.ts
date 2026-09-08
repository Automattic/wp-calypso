import { deferToolProvider, mergeToolProviders } from '../compose-tool-providers';
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

		const abilities = await mergeToolProviders( [ first, second ] ).getAbilities();

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
		const merged = mergeToolProviders( [ first, second ] );

		await expect( merged.executeAbility( 'demo/read', {} ) ).resolves.toEqual( { from: 'first' } );
		await expect( merged.executeAbility( 'demo__write', { a: 1 } ) ).resolves.toEqual( {
			from: 'second',
		} );
		expect( first.executeAbility ).toHaveBeenCalledTimes( 1 );
		expect( second.executeAbility ).toHaveBeenCalledWith( 'demo__write', { a: 1 } );
	} );

	it( 'rejects an ability no provider lists', async () => {
		await expect(
			mergeToolProviders( [ createProvider( [] ) ] ).executeAbility( 'demo/missing', {} )
		).rejects.toThrow( 'demo/missing' );
	} );
} );

describe( 'deferToolProvider', () => {
	it( 'serves nothing until the provider arrives, then reads it live', async () => {
		const holder: { current?: ToolProvider } = {};
		const deferred = deferToolProvider( () => holder.current );

		expect( await deferred.getAbilities() ).toEqual( [] );
		await expect( deferred.executeAbility( 'demo/read', {} ) ).rejects.toThrow( 'demo/read' );

		holder.current = createProvider( [ createAbility( 'demo/read' ) ] );
		expect( ( await deferred.getAbilities() ).map( ( ability ) => ability.name ) ).toEqual( [
			'demo/read',
		] );
		await expect( deferred.executeAbility( 'demo/read', {} ) ).resolves.toEqual( { ok: true } );
	} );
} );
