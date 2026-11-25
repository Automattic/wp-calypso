import {
	registerAbility,
	registerAbilityCategory,
	unregisterAbility,
	unregisterAbilityCategory,
} from '@wordpress/abilities';
import { vi } from 'vitest';
import { withRegistryAbilities } from '../registry-ability-provider';
import type { ToolProvider } from '../../extension-types';
import type { Ability } from '@wordpress/abilities';

const CATEGORY = 'webmcp-test';

const createAbility = ( name: string, callback = vi.fn() ): Ability => ( {
	name,
	label: name,
	description: `Description for ${ name }`,
	category: CATEGORY,
	callback,
} );

describe( 'withRegistryAbilities', () => {
	const registryCallback = vi.fn().mockResolvedValue( 'from registry' );
	const providerAbility = createAbility( 'test/shared' );
	const toolProvider: ToolProvider = {
		getAbilities: vi.fn().mockResolvedValue( [ providerAbility ] ),
		executeAbility: vi.fn().mockResolvedValue( 'from provider' ),
	};

	beforeEach( () => {
		registerAbilityCategory( CATEGORY, { label: 'Test', description: 'Test abilities' } );
		registerAbility( createAbility( 'test/shared', registryCallback ) );
		registerAbility( createAbility( 'test/registry-only', registryCallback ) );
	} );

	afterEach( () => {
		unregisterAbility( 'test/shared' );
		unregisterAbility( 'test/registry-only' );
		unregisterAbilityCategory( CATEGORY );
		vi.clearAllMocks();
	} );

	it( 'adds registry abilities and keeps the provider ability on a name clash', async () => {
		const abilities = await withRegistryAbilities( toolProvider ).getAbilities();

		expect( abilities.map( ( ability ) => ability.name ) ).toEqual( [
			'test/shared',
			'test/registry-only',
		] );
		expect( abilities[ 0 ] ).toBe( providerAbility );
	} );

	it( 'runs a provider ability through the provider and the rest through the registry', async () => {
		const provider = withRegistryAbilities( toolProvider );

		await expect( provider.executeAbility( 'test/shared', {} ) ).resolves.toBe( 'from provider' );
		await expect( provider.executeAbility( 'test/registry-only', {} ) ).resolves.toBe(
			'from registry'
		);
		expect( registryCallback ).toHaveBeenCalledTimes( 1 );
	} );
} );
