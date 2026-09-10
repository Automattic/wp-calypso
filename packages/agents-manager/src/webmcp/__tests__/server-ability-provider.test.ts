import apiFetch from '@wordpress/api-fetch';
import { createServerAbilityProvider } from '../server-ability-provider';
import type { Ability } from '../../abilities/types';

jest.mock( '@wordpress/api-fetch' );

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

describe( 'createServerAbilityProvider', () => {
	beforeEach( () => {
		jest.mocked( apiFetch ).mockReset();
	} );

	it( 'preserves REST definitions for exposure after merging, marked as server-registered', async () => {
		jest
			.mocked( apiFetch )
			.mockResolvedValueOnce( [
				serverAbility,
				{ ...serverAbility, name: 'wpcom/delete-site' },
				publicReadAbility,
				publicWriteAbility,
				channelWriteAbility,
			] );

		const abilities = await createServerAbilityProvider().getAbilities();

		expect( abilities.map( ( ability ) => ability.name ) ).toEqual( [
			'wpcom/get-posts',
			'wpcom/delete-site',
			'other-plugin/get-site-health',
			'other-plugin/publish-post',
			'other-plugin/create-note',
		] );
		expect( abilities[ 0 ] ).toEqual( {
			...serverAbility,
			meta: {
				...serverAbility.meta,
				annotations: { ...serverAbility.meta?.annotations, serverRegistered: true },
			},
		} );
		expect( apiFetch ).toHaveBeenCalledWith( {
			path: expect.stringContaining( 'webmcp=1' ),
		} );
	} );

	it( 'fetches the list once and reuses it', async () => {
		jest.mocked( apiFetch ).mockResolvedValueOnce( [ serverAbility ] );
		const provider = createServerAbilityProvider();

		await provider.getAbilities();
		await provider.getAbilities();

		expect( apiFetch ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'executes read-only abilities through GET, by either name form', async () => {
		jest
			.mocked( apiFetch )
			.mockResolvedValueOnce( [ serverAbility ] )
			.mockResolvedValue( { posts: [] } );
		const provider = createServerAbilityProvider();

		await expect(
			provider.executeAbility( 'wpcom__get_posts', { fields: 'summary' } )
		).resolves.toEqual( { posts: [] } );
		expect( apiFetch ).toHaveBeenLastCalledWith( {
			method: 'GET',
			path: expect.stringMatching( /wp-abilities\/v1\/abilities\/wpcom\/get-posts\/run.*webmcp=1/ ),
		} );
	} );

	it( 'executes mutating abilities through POST with a JSON body', async () => {
		jest
			.mocked( apiFetch )
			.mockResolvedValueOnce( [ mutatingServerAbility ] )
			.mockResolvedValueOnce( { data: { id: 123, source_url: 'https://example.com/image.jpg' } } );
		const input = {
			wpcom_site: 'example.wordpress.com',
			file_content_base64: 'aW1hZ2U=',
			filename: 'image.jpg',
			mime_type: 'image/jpeg',
			user_confirmed: true,
		};

		await createServerAbilityProvider().executeAbility( 'wpcom/media-create', input );

		expect( apiFetch ).toHaveBeenLastCalledWith( {
			method: 'POST',
			path: expect.stringMatching(
				/wp-abilities\/v1\/abilities\/wpcom\/media-create\/run.*webmcp=1/
			),
			data: { input },
		} );
	} );

	it( 'rejects an ability it does not serve', async () => {
		jest.mocked( apiFetch ).mockResolvedValueOnce( [ serverAbility ] );

		await expect(
			createServerAbilityProvider().executeAbility( 'wpcom/delete-site', {} )
		).rejects.toThrow( 'wpcom/delete-site' );
	} );

	it( 'propagates failed discovery and retries on the next read', async () => {
		jest
			.mocked( apiFetch )
			.mockRejectedValueOnce( new Error( 'Request failed' ) )
			.mockResolvedValueOnce( [ serverAbility ] );
		const provider = createServerAbilityProvider();

		await expect( provider.getAbilities() ).rejects.toThrow( 'Request failed' );
		expect( ( await provider.getAbilities() ).map( ( ability ) => ability.name ) ).toEqual( [
			'wpcom/get-posts',
		] );
	} );

	it.each( [
		[ true, true, true, 'GET' ],
		[ true, false, false, 'GET' ],
		[ false, true, true, 'DELETE' ],
		[ false, true, false, 'POST' ],
		[ false, false, true, 'POST' ],
		[ false, false, false, 'POST' ],
		[ undefined, undefined, undefined, 'POST' ],
	] )(
		'routes readonly=%s destructive=%s idempotent=%s through %s',
		async ( readonly, destructive, idempotent, method ) => {
			jest
				.mocked( apiFetch )
				.mockResolvedValueOnce( [
					{
						...channelWriteAbility,
						meta: { webmcp: { public: true }, annotations: { readonly, destructive, idempotent } },
					},
				] )
				.mockResolvedValue( {} );
			await createServerAbilityProvider().executeAbility( channelWriteAbility.name, { id: 123 } );

			const request = jest.mocked( apiFetch ).mock.calls[ 1 ][ 0 ];
			expect( request.method ).toBe( method );
			expect( request.data ).toEqual( method === 'POST' ? { input: { id: 123 } } : undefined );
			expect(
				new URL( request.path!, 'https://example.com' ).searchParams.get( 'input[id]' )
			).toBe( method === 'POST' ? null : '123' );
		}
	);
} );
