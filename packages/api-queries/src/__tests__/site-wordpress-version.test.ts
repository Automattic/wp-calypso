import { fetchWordPressTrackVersions, fetchWpOrgCoreVersion } from '@automattic/api-core';
import { siteWordPressTrackVersionsQuery } from '../site-wordpress-version';

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	fetchWordPressTrackVersions: jest.fn(),
	fetchWpOrgCoreVersion: jest.fn(),
} ) );

const mockFetchWordPressTrackVersions = fetchWordPressTrackVersions as jest.MockedFunction<
	typeof fetchWordPressTrackVersions
>;
const mockFetchWpOrgCoreVersion = fetchWpOrgCoreVersion as jest.MockedFunction<
	typeof fetchWpOrgCoreVersion
>;

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
