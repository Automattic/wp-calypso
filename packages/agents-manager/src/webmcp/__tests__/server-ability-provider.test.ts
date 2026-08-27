import apiFetch from '@wordpress/api-fetch';
import { createWebMcpToolProvider } from '../server-ability-provider';
import type { Ability } from '../../abilities/types';
import type { ToolProvider } from '../../extension-types';

jest.mock( '@wordpress/api-fetch' );

const clientAbility: Ability = {
	name: 'agents-manager/get-block-tree',
	label: 'Get block tree',
	description: 'Read the editor block tree.',
	category: 'big-sky',
	input_schema: { type: 'object', properties: {} },
	meta: { annotations: { clientRegistered: true } },
};

const serverAbility: Ability = {
	name: 'wpcom/get-posts',
	label: 'Get posts',
	description: 'Get posts from this site.',
	category: 'wpcom',
	input_schema: { type: 'object', properties: {} },
	meta: { annotations: { readonly: true, idempotent: true } },
};

describe( 'WebMCP server ability provider', () => {
	beforeEach( () => {
		jest.mocked( apiFetch ).mockReset();
	} );

	it( 'adds only allowlisted REST abilities and marks their provenance', async () => {
		jest
			.mocked( apiFetch )
			.mockResolvedValueOnce( [ serverAbility, { ...serverAbility, name: 'wpcom/delete-site' } ] );
		const toolProvider: ToolProvider = {
			getAbilities: jest.fn( async () => [ clientAbility ] ),
			executeAbility: jest.fn(),
		};

		const provider = createWebMcpToolProvider( toolProvider );
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
		jest.mocked( apiFetch ).mockResolvedValueOnce( [ serverAbility ] );
		const toolProvider: ToolProvider = {
			getAbilities: jest.fn( async () => [
				clientAbility,
				{
					...serverAbility,
					meta: { annotations: { readonly: true } },
				},
			] ),
			executeAbility: jest.fn(),
		};

		const abilities = await createWebMcpToolProvider( toolProvider ).getAbilities();

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
		jest
			.mocked( apiFetch )
			.mockResolvedValueOnce( [ serverAbility ] )
			.mockResolvedValueOnce( { posts: [] } );
		const toolProvider: ToolProvider = {
			getAbilities: jest.fn( async () => [ clientAbility ] ),
			executeAbility: jest.fn(),
		};
		const provider = createWebMcpToolProvider( toolProvider );

		await expect(
			provider.executeAbility( 'wpcom/get-posts', { fields: 'summary' } )
		).resolves.toEqual( { posts: [] } );
		expect( apiFetch ).toHaveBeenLastCalledWith( {
			method: 'GET',
			path: expect.stringMatching( /wp-abilities\/v1\/abilities\/wpcom\/get-posts\/run/ ),
		} );
		expect( toolProvider.executeAbility ).not.toHaveBeenCalled();
	} );

	it( 'keeps client ability execution on the existing provider', async () => {
		jest.mocked( apiFetch ).mockResolvedValueOnce( [ serverAbility ] );
		const toolProvider: ToolProvider = {
			getAbilities: jest.fn( async () => [ clientAbility ] ),
			executeAbility: jest.fn( async () => ( { ok: true } ) ),
		};
		const provider = createWebMcpToolProvider( toolProvider );

		await expect( provider.executeAbility( clientAbility.name, {} ) ).resolves.toEqual( {
			ok: true,
		} );
		expect( toolProvider.executeAbility ).toHaveBeenCalledWith( clientAbility.name, {} );
	} );

	it( 'keeps client abilities available when the REST request fails', async () => {
		jest.mocked( apiFetch ).mockRejectedValueOnce( new Error( 'Request failed' ) );
		// eslint-disable-next-line no-console
		const warn = jest.spyOn( console, 'warn' ).mockImplementation();
		const toolProvider: ToolProvider = {
			getAbilities: jest.fn( async () => [ clientAbility ] ),
			executeAbility: jest.fn(),
		};

		await expect( createWebMcpToolProvider( toolProvider ).getAbilities() ).resolves.toEqual( [
			clientAbility,
		] );
		expect( warn ).toHaveBeenCalledWith(
			'[AgentsManager] Failed to load WebMCP server abilities:',
			expect.any( Error )
		);
	} );
} );
