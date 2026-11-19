import { fetchWordPressTrackVersions, fetchWpOrgCoreVersion } from '@automattic/api-core';
import { vi } from 'vitest';
import { siteWordPressTrackVersionsQuery } from '../site-wordpress-version';

vi.mock( '@automattic/api-core', async ( importOriginal ) => ( {
	...( await importOriginal< typeof import( '@automattic/api-core' ) >() ),
	fetchWordPressTrackVersions: vi.fn(),
	fetchWpOrgCoreVersion: vi.fn(),
} ) );

const mockFetchWordPressTrackVersions = vi.mocked( fetchWordPressTrackVersions );
const mockFetchWpOrgCoreVersion = vi.mocked( fetchWpOrgCoreVersion );

describe( 'siteWordPressTrackVersionsQuery', () => {
	const queryFn = siteWordPressTrackVersionsQuery( 123 ).queryFn!;

	beforeEach( () => {
		mockFetchWpOrgCoreVersion.mockImplementation( async ( channel ) =>
			channel === 'beta' ? '7.2-beta2' : '7.1.3'
		);
	} );

	it( 'returns the versions the tracks serve, even when wordpress.org is ahead', async () => {
		mockFetchWordPressTrackVersions.mockResolvedValue( { latest: '7.1.3', beta: '7.2-beta1' } );

		await expect( queryFn( {} as never ) ).resolves.toEqual( {
			latest: '7.1.3',
			beta: '7.2-beta1',
		} );
	} );

	it( 'falls back to the wordpress.org versions when the site cannot report them', async () => {
		mockFetchWordPressTrackVersions.mockRejectedValue( new Error( 'rest_no_route' ) );

		await expect( queryFn( {} as never ) ).resolves.toEqual( {
			latest: '7.1.3',
			beta: '7.2-beta2',
		} );
	} );
} );
