import { getSyncSourceSiteData } from '../get-sync-source-site';

describe( 'getSyncSourceSiteData', () => {
	test( 'returns the syncing source site when present', () => {
		expect( getSyncSourceSiteData( { syncingSourceSite: 'production' } ) ).toBe( 'production' );
	} );

	test( 'preserves a reducer-set null (site present, not syncing)', () => {
		expect( getSyncSourceSiteData( { syncingSourceSite: null } ) ).toBeNull();
	} );

	test( 'returns null when there is no sync data', () => {
		expect( getSyncSourceSiteData( {} ) ).toBeNull();
	} );
} );
