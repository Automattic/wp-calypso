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
	it( 'snapshots original names with their winning definitions and owners', async () => {
		const read = createAbility( 'demo/read', 'First copy' );
		const write = createAbility( 'demo/write' );
		const first = createProvider( [ read ] );
		const second = createProvider( [ createAbility( 'demo/read', 'Second copy' ), write ] );

		const snapshot = await mergeToolProviders( () => [ first, second ], jest.fn() ).getSnapshot();

		expect( [ ...snapshot.entries() ] ).toEqual( [
			[ 'demo/read', { ability: read, provider: first } ],
			[ 'demo/write', { ability: write, provider: second } ],
		] );
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
} );
