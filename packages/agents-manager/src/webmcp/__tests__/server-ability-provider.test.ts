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

const mutatingServerAbility: Ability = {
	name: 'wpcom/media-create',
	label: 'Upload media',
	description: 'Upload media to this site.',
	category: 'wpcom',
	input_schema: { type: 'object', properties: {} },
	meta: { annotations: { readonly: false, destructive: false, idempotent: false } },
};

const publicReadAbility: Ability = {
	name: 'other-plugin/get-site-health',
	label: 'Get site health',
	description: 'Read the site health summary.',
	category: 'other-plugin',
	input_schema: { type: 'object', properties: {} },
	meta: { public: true, annotations: { readonly: true, idempotent: true } },
};

const publicWriteAbility: Ability = {
	name: 'other-plugin/publish-post',
	label: 'Publish post',
	description: 'Publish a post.',
	category: 'other-plugin',
	input_schema: { type: 'object', properties: {} },
	meta: { public: true, annotations: { readonly: false } },
};

const channelWriteAbility: Ability = {
	name: 'other-plugin/create-note',
	label: 'Create note',
	description: 'Create a private note.',
	category: 'other-plugin',
	input_schema: { type: 'object', properties: {} },
	meta: { webmcp: { public: true }, annotations: { readonly: false } },
};

describe( 'WebMCP server ability provider', () => {
	beforeEach( () => {
		jest.mocked( apiFetch ).mockReset();
	} );

	it( 'adds REST abilities that pass the exposure policy and marks their provenance', async () => {
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

	it( 'lets flagged REST abilities through without an allowlist entry', async () => {
		jest
			.mocked( apiFetch )
			.mockResolvedValueOnce( [ publicReadAbility, publicWriteAbility, channelWriteAbility ] )
			.mockResolvedValueOnce( { created: true } );
		const toolProvider: ToolProvider = {
			getAbilities: jest.fn( async () => [] ),
			executeAbility: jest.fn(),
		};
		const provider = createWebMcpToolProvider( toolProvider );

		const names = ( await provider.getAbilities() ).map( ( ability ) => ability.name );
		expect( names ).toEqual( [ publicReadAbility.name, channelWriteAbility.name ] );

		await expect(
			provider.executeAbility( channelWriteAbility.name, { title: 'Hello' } )
		).resolves.toEqual( { created: true } );
		expect( apiFetch ).toHaveBeenLastCalledWith( {
			method: 'POST',
			path: expect.stringMatching( /other-plugin\/create-note\/run/ ),
			data: { input: { title: 'Hello' } },
		} );
		expect( toolProvider.executeAbility ).not.toHaveBeenCalled();
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

	it( 'executes mutating server abilities through POST with a JSON body', async () => {
		jest
			.mocked( apiFetch )
			.mockResolvedValueOnce( [ mutatingServerAbility ] )
			.mockResolvedValueOnce( { data: { id: 123, source_url: 'https://example.com/image.jpg' } } );
		const toolProvider: ToolProvider = {
			getAbilities: jest.fn( async () => [ clientAbility ] ),
			executeAbility: jest.fn(),
		};
		const provider = createWebMcpToolProvider( toolProvider );
		const input = {
			wpcom_site: 'example.wordpress.com',
			file_content_base64: 'aW1hZ2U=',
			filename: 'image.jpg',
			mime_type: 'image/jpeg',
			user_confirmed: true,
		};

		await provider.executeAbility( 'wpcom/media-create', input );

		expect( apiFetch ).toHaveBeenLastCalledWith( {
			method: 'POST',
			path: expect.stringMatching(
				/wp-abilities\/v1\/abilities\/wpcom\/media-create\/run.*webmcp=1/
			),
			data: { input },
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
