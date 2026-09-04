import { executeAbility, getAbilities } from '@wordpress/abilities';
import { createRegistryToolProvider } from '../registry-tool-provider';
import type { Ability } from '../../abilities/types';
import type { ToolProvider } from '../../extension-types';

jest.mock( '@wordpress/abilities', () => ( {
	executeAbility: jest.fn(),
	getAbilities: jest.fn( () => [] ),
} ) );
jest.mock( '@wordpress/data', () => ( { select: jest.fn() } ) );

const createAbility = ( name: string, overrides: Partial< Ability > = {} ): Ability => ( {
	name,
	label: name,
	description: `Description for ${ name }`,
	category: 'demo',
	input_schema: { type: 'object', properties: {} },
	meta: { annotations: { clientRegistered: true, readonly: true } },
	...overrides,
} );

describe( 'createRegistryToolProvider', () => {
	beforeEach( () => {
		jest.mocked( getAbilities ).mockReset().mockReturnValue( [] );
		jest.mocked( executeAbility ).mockReset();
	} );

	it( 'lists chain definitions first and fills in the rest from the registry', async () => {
		const chainCopy = createAbility( 'agents-manager/get-block-tree', { label: 'Chain copy' } );
		const registryCopy = createAbility( 'agents-manager/get-block-tree', {
			label: 'Registry copy',
		} );
		const registryOnly = createAbility( 'demo/read-panel' );
		jest.mocked( getAbilities ).mockReturnValue( [ registryCopy, registryOnly ] );
		const chain: ToolProvider = {
			getAbilities: jest.fn( async () => [ chainCopy ] ),
			executeAbility: jest.fn(),
		};

		const abilities = await createRegistryToolProvider( () => chain ).getAbilities();

		expect( abilities.map( ( ability ) => ability.label ) ).toEqual( [
			'Chain copy',
			'demo/read-panel',
		] );
	} );

	it( 'serves the registry alone when no chain is available', async () => {
		jest.mocked( getAbilities ).mockReturnValue( [ createAbility( 'demo/read-panel' ) ] );
		jest.mocked( executeAbility ).mockResolvedValue( { tone: 'calm' } );
		const provider = createRegistryToolProvider( () => undefined );

		expect( ( await provider.getAbilities() ).map( ( ability ) => ability.name ) ).toEqual( [
			'demo/read-panel',
		] );
		await expect( provider.executeAbility( 'demo/read-panel', {} ) ).resolves.toEqual( {
			tone: 'calm',
		} );
		expect( executeAbility ).toHaveBeenCalledWith( 'demo/read-panel', {} );
	} );

	it( 'executes through the chain when it lists the ability, by either name form', async () => {
		const chain: ToolProvider = {
			getAbilities: jest.fn( async () => [ createAbility( 'big-sky/show-template' ) ] ),
			executeAbility: jest.fn( async () => ( { shown: true } ) ),
		};
		const provider = createRegistryToolProvider( () => chain );

		await expect( provider.executeAbility( 'big-sky/show-template', {} ) ).resolves.toEqual( {
			shown: true,
		} );
		await expect( provider.executeAbility( 'big_sky__show_template', {} ) ).resolves.toEqual( {
			shown: true,
		} );
		expect( chain.executeAbility ).toHaveBeenCalledTimes( 2 );
		expect( executeAbility ).not.toHaveBeenCalled();
	} );

	it( 'executes through the registry with the registered name otherwise', async () => {
		jest.mocked( getAbilities ).mockReturnValue( [ createAbility( 'demo/read-panel' ) ] );
		jest.mocked( executeAbility ).mockResolvedValue( { tone: 'calm' } );
		const chain: ToolProvider = {
			getAbilities: jest.fn( async () => [] ),
			executeAbility: jest.fn(),
		};
		const provider = createRegistryToolProvider( () => chain );

		await expect(
			provider.executeAbility( 'demo__read_panel', { verbose: true } )
		).resolves.toEqual( { tone: 'calm' } );
		expect( executeAbility ).toHaveBeenCalledWith( 'demo/read-panel', { verbose: true } );
		expect( chain.executeAbility ).not.toHaveBeenCalled();
	} );

	it( 'reads the chain live so a provider that arrives later is honoured', async () => {
		const chainRef: { current?: ToolProvider } = {};
		const provider = createRegistryToolProvider( () => chainRef.current );
		expect( await provider.getAbilities() ).toEqual( [] );

		chainRef.current = {
			getAbilities: jest.fn( async () => [ createAbility( 'big-sky/apply-block-edits' ) ] ),
			executeAbility: jest.fn(),
		};
		expect( ( await provider.getAbilities() ).map( ( ability ) => ability.name ) ).toEqual( [
			'big-sky/apply-block-edits',
		] );
	} );
} );
