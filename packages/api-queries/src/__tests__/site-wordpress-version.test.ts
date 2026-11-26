import { fetchWordPressTrackVersions, fetchWpOrgCoreVersion } from '@automattic/api-core';
import { vi } from 'vitest';
import { siteWordPressTrackVersionsQuery } from '../site-wordpress-version';

vi.mock( '@automattic/api-core', async ( importOriginal ) => ( {
	...( await importOriginal< typeof import( '@automattic/api-core' ) >() ),
	fetchWordPressTrackVersions: vi.fn(),
	fetchWpOrgCoreVersion: vi.fn(),
} ) );

describe( 'siteWordPressTrackVersionsQuery', () => {
	it( 'falls back to the wordpress.org versions when the site cannot report them', async () => {
		vi.mocked( fetchWordPressTrackVersions ).mockRejectedValue( new Error( 'rest_no_route' ) );
		vi.mocked( fetchWpOrgCoreVersion ).mockImplementation( async ( channel ) =>
			channel === 'beta' ? '7.2-beta2' : '7.1.3'
		);

		const versions = await siteWordPressTrackVersionsQuery( 123 ).queryFn!( {} as never );

		expect( versions ).toStrictEqual( { latest: '7.1.3', beta: '7.2-beta2' } );
	} );
} );
