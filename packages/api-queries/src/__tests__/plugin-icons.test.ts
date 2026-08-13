/**
 * @jest-environment jsdom
 */
import { fetchWpOrgPluginIcons } from '@automattic/api-core';
import { wpOrgPluginIconQuery } from '../plugin';

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	fetchWpOrgPluginIcons: jest.fn(),
} ) );

const mockedFetch = fetchWpOrgPluginIcons as jest.MockedFunction< typeof fetchWpOrgPluginIcons >;

const run = ( slug: string ) =>
	( wpOrgPluginIconQuery( slug ).queryFn as () => Promise< string | null > )();

describe( 'wpOrgPluginIconQuery', () => {
	beforeEach( () => {
		mockedFetch.mockReset();
	} );

	it( 'coalesces slugs queued in the same tick into one request', async () => {
		mockedFetch.mockResolvedValue( {
			jetpack: 'https://ps.w.org/jetpack/assets/icon.svg',
			akismet: 'https://ps.w.org/akismet/assets/icon-128x128.png',
		} );

		const [ jetpack, akismet ] = await Promise.all( [ run( 'jetpack' ), run( 'akismet' ) ] );

		expect( mockedFetch ).toHaveBeenCalledTimes( 1 );
		expect( mockedFetch ).toHaveBeenCalledWith( [ 'jetpack', 'akismet' ] );
		expect( jetpack ).toBe( 'https://ps.w.org/jetpack/assets/icon.svg' );
		expect( akismet ).toBe( 'https://ps.w.org/akismet/assets/icon-128x128.png' );
	} );

	// React Query rejects `undefined` as query data, and a plugin with no icon
	// still has to settle rather than retry forever.
	it( 'resolves null for a plugin wp.org has no icon for', async () => {
		mockedFetch.mockResolvedValue( {} );

		await expect( run( 'classic-widgets' ) ).resolves.toBeNull();
	} );

	it( 'rejects every slug in a batch when the request fails', async () => {
		mockedFetch.mockRejectedValue( new Error( 'wp.org plugin directory responded 503' ) );

		const results = await Promise.allSettled( [ run( 'jetpack' ), run( 'akismet' ) ] );

		expect( mockedFetch ).toHaveBeenCalledTimes( 1 );
		expect( results.map( ( result ) => result.status ) ).toEqual( [ 'rejected', 'rejected' ] );
	} );

	it( 'starts a fresh batch for slugs queued in a later tick', async () => {
		mockedFetch.mockResolvedValue( {} );

		await run( 'jetpack' );
		await run( 'akismet' );

		expect( mockedFetch ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'keys the cache per slug so a growing list only adds entries', () => {
		expect( wpOrgPluginIconQuery( 'jetpack' ).queryKey ).toEqual( [
			'wp-org-plugin-icon',
			'jetpack',
		] );
	} );

	// Persisting one entry per plugin ever scrolled past would grow unbounded.
	it( 'opts out of the persisted query cache', () => {
		expect( wpOrgPluginIconQuery( 'jetpack' ).meta ).toEqual( { persist: false } );
	} );
} );
