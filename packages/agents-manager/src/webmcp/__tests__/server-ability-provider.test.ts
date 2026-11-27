import apiFetch from '@wordpress/api-fetch';
import { vi } from 'vitest';
import { withServerAbilities } from '../server-ability-provider';
import type { ToolProvider } from '../../extension-types';
import type { Ability } from '@wordpress/abilities';

vi.mock( '@wordpress/api-fetch' );

const clientAbility: Ability = {
	name: 'agents-manager/get-block-tree',
	label: 'Get block tree',
	description: 'Read the editor block tree.',
	category: 'agents-manager',
	input_schema: { type: 'object', properties: {} },
	meta: { annotations: { clientRegistered: true } },
};

const serverAbility: Ability = {
	name: 'wpcom/get-block-schemas',
	label: 'Get block schemas',
	description: 'Get the block schemas for this site.',
	category: 'wpcom',
	input_schema: { type: 'object', properties: {} },
	meta: { annotations: { readonly: true, idempotent: true } },
};

describe( 'WebMCP server ability provider', () => {
	beforeEach( () => {
		vi.mocked( apiFetch ).mockReset();
	} );

	it( 'adds only allowlisted REST abilities and marks their provenance', async () => {
		vi.mocked( apiFetch ).mockResolvedValueOnce( [
			serverAbility,
			{ ...serverAbility, name: 'wpcom/delete-site' },
		] );
		const toolProvider: ToolProvider = {
			getAbilities: vi.fn( async () => [ clientAbility ] ),
			executeAbility: vi.fn(),
		};

		const provider = withServerAbilities( toolProvider );
		await expect( provider.getAbilities() ).resolves.toEqual( [
			clientAbility,
			{
				...serverAbility,
				meta: {
					...serverAbility.meta,
					annotations: {
						...serverAbility.meta?.annotations,
						serverRegistered: true,
					},
				},
			},
		] );
		expect( apiFetch ).toHaveBeenCalledWith( {
			path: expect.stringContaining( 'webmcp=1' ),
		} );
	} );

	it( 'prefers the REST definition when the provider already advertises the ability', async () => {
		vi.mocked( apiFetch ).mockResolvedValueOnce( [ serverAbility ] );
		const toolProvider: ToolProvider = {
			getAbilities: vi.fn( async () => [
				clientAbility,
				{
					...serverAbility,
					meta: { annotations: { readonly: true } },
				},
			] ),
			executeAbility: vi.fn(),
		};

		const abilities = await withServerAbilities( toolProvider ).getAbilities();

		expect( abilities ).toHaveLength( 2 );
		expect( abilities.find( ( ability ) => ability.name === serverAbility.name ) ).toEqual(
			expect.objectContaining( {
				meta: expect.objectContaining( {
					annotations: expect.objectContaining( { serverRegistered: true } ),
				} ),
			} )
		);
	} );

	it( 'executes server abilities through the read-only REST route', async () => {
		vi.mocked( apiFetch )
			.mockResolvedValueOnce( [ serverAbility ] )
			.mockResolvedValueOnce( { blocks: [] } );
		const toolProvider: ToolProvider = {
			getAbilities: vi.fn( async () => [ clientAbility ] ),
			executeAbility: vi.fn(),
		};
		const provider = withServerAbilities( toolProvider );

		await expect(
			provider.executeAbility( 'wpcom/get-block-schemas', { fields: 'summary' } )
		).resolves.toEqual( { blocks: [] } );
		expect( apiFetch ).toHaveBeenLastCalledWith( {
			method: 'GET',
			path: expect.stringMatching( /wp-abilities\/v1\/abilities\/wpcom\/get-block-schemas\/run/ ),
		} );
		expect( toolProvider.executeAbility ).not.toHaveBeenCalled();
	} );

	it( 'keeps client ability execution on the existing provider', async () => {
		vi.mocked( apiFetch ).mockResolvedValueOnce( [ serverAbility ] );
		const toolProvider: ToolProvider = {
			getAbilities: vi.fn( async () => [ clientAbility ] ),
			executeAbility: vi.fn( async () => ( { ok: true } ) ),
		};
		const provider = withServerAbilities( toolProvider );

		await expect( provider.executeAbility( clientAbility.name, {} ) ).resolves.toEqual( {
			ok: true,
		} );
		expect( toolProvider.executeAbility ).toHaveBeenCalledWith( clientAbility.name, {} );
	} );

	it( 'keeps client abilities available when the REST request fails', async () => {
		vi.mocked( apiFetch ).mockRejectedValueOnce( new Error( 'Request failed' ) );
		// eslint-disable-next-line no-console
		const warn = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		const toolProvider: ToolProvider = {
			getAbilities: vi.fn( async () => [ clientAbility ] ),
			executeAbility: vi.fn(),
		};

		await expect( withServerAbilities( toolProvider ).getAbilities() ).resolves.toEqual( [
			clientAbility,
		] );
		expect( warn ).toHaveBeenCalledWith(
			'[AgentsManager] Failed to load WebMCP server abilities:',
			expect.any( Error )
		);
	} );
} );
