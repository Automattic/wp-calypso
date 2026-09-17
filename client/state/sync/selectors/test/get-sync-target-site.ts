import { getSyncTargetSiteData } from '../get-sync-target-site';

describe( 'getSyncTargetSiteData', () => {
	test( 'returns the syncing target site when present', () => {
		expect( getSyncTargetSiteData( { syncingTargetSite: 'staging' } ) ).toBe( 'staging' );
	} );

	test( 'preserves a reducer-set null (site present, not syncing)', () => {
		expect( getSyncTargetSiteData( { syncingTargetSite: null } ) ).toBeNull();
	} );

	test( 'returns null when there is no sync data', () => {
		expect( getSyncTargetSiteData( {} ) ).toBeNull();
	} );
} );
