import { getSyncSiteLastRestoreIdData } from '../get-sync-last-restore-id';

describe( 'getSyncSiteLastRestoreIdData', () => {
	test( 'returns the last restore ID when present', () => {
		expect( getSyncSiteLastRestoreIdData( { lastRestoreId: 'restore-123' } ) ).toBe(
			'restore-123'
		);
	} );

	test( 'preserves a reducer-set null', () => {
		expect( getSyncSiteLastRestoreIdData( { lastRestoreId: null } ) ).toBeNull();
	} );

	test( 'returns an empty string when there is no sync data', () => {
		expect( getSyncSiteLastRestoreIdData( {} ) ).toBe( '' );
	} );
} );
