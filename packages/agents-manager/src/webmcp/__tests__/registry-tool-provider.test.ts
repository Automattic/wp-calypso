import { executeAbility, getAbilities } from '@wordpress/abilities';
import { createRegistryToolProvider } from '../registry-tool-provider';
import type { Ability } from '../../abilities/types';

jest.mock( '@wordpress/abilities', () => ( {
	executeAbility: jest.fn(),
	getAbilities: jest.fn( () => [] ),
} ) );
jest.mock( '@wordpress/data', () => ( { select: jest.fn() } ) );

const ability: Ability = {
	name: 'demo/read-panel',
	label: 'Read panel',
	description: 'Read the demo panel.',
	category: 'demo',
	input_schema: { type: 'object', properties: {} },
	meta: { annotations: { clientRegistered: true, readonly: true } },
};

describe( 'createRegistryToolProvider', () => {
	beforeEach( () => {
		jest.mocked( getAbilities ).mockReset().mockReturnValue( [ ability ] );
		jest.mocked( executeAbility ).mockReset().mockResolvedValue( { tone: 'calm' } );
	} );

	it( 'lists whatever the registry holds', async () => {
		const abilities = await createRegistryToolProvider().getAbilities();

		expect( abilities.map( ( item ) => item.name ) ).toEqual( [ 'demo/read-panel' ] );
	} );

	it( 'executes through the registry with the registered name for either name form', async () => {
		const provider = createRegistryToolProvider();

		await expect(
			provider.executeAbility( 'demo__read_panel', { verbose: true } )
		).resolves.toEqual( { tone: 'calm' } );
		await expect( provider.executeAbility( 'demo/read-panel', {} ) ).resolves.toEqual( {
			tone: 'calm',
		} );
		expect( executeAbility ).toHaveBeenNthCalledWith( 1, 'demo/read-panel', { verbose: true } );
		expect( executeAbility ).toHaveBeenNthCalledWith( 2, 'demo/read-panel', {} );
	} );

	it( 'passes an unknown name through so the registry reports it', async () => {
		jest
			.mocked( executeAbility )
			.mockRejectedValue( new Error( 'Ability not found: demo/missing' ) );

		await expect(
			createRegistryToolProvider().executeAbility( 'demo/missing', {} )
		).rejects.toThrow( 'Ability not found' );
		expect( executeAbility ).toHaveBeenCalledWith( 'demo/missing', {} );
	} );
} );
